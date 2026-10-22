import Anthropic from "@anthropic-ai/sdk";
import { waitUntil } from "@vercel/functions";
import { buildSystemPrompt } from "@/lib/red-rose-knowledge";
import { createStreamCleaner } from "@/lib/chat/sanitize";
import { extractAndCreateLead } from "@/lib/chat/extract-lead";
import { PHONE_DISPLAY } from "@/lib/site-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Chat replies are two to four sentences by instruction, so this ceiling is
 * generous. It is also the single biggest lever on worst-case spend: output
 * is billed at $20/MTok, so every 1024 tokens shaved here halves what an
 * abusive request can cost.
 */
const MAX_TOKENS = 1024;

/* ── Spend guard ──────────────────────────────────────────────────────────
 * /api/chat is a public endpoint that spends money on every call. Without a
 * limit, a trivial script can drain a month of API credit in an afternoon.
 *
 * This is in-memory, so on serverless it is per-instance and resets on cold
 * start: a speed bump, not a wall. The durable fix is a rate-limit rule at
 * the Vercel firewall, which sits in front of the function and cannot be
 * bypassed by spreading load across instances.
 */
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MAX = 12;
const HOUR_WINDOW_MS = 60 * 60 * 1000;
const HOUR_MAX = 40;

const hitsByIp = new Map<string, number[]>();

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (hitsByIp.get(ip) || []).filter((t) => t > now - HOUR_WINDOW_MS);
  hits.push(now);
  hitsByIp.set(ip, hits);

  // Keep the map from growing without bound on a long-lived instance.
  // forEach rather than for..of: this project's TS target predates
  // downlevelIteration for Map.
  if (hitsByIp.size > 5000) {
    hitsByIp.forEach((times: number[], key: string) => {
      if (times.every((t: number) => t <= now - HOUR_WINDOW_MS)) {
        hitsByIp.delete(key);
      }
    });
  }

  const burst = hits.filter((t) => t > now - BURST_WINDOW_MS).length;
  return burst <= BURST_MAX && hits.length <= HOUR_MAX;
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Lazily construct the client.
 *
 * Never throw at module scope: Next evaluates route modules while collecting
 * page data, so a missing key here would break every build the way
 * RESEND_API_KEY once broke every preview deployment.
 */
function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

type IncomingMessage = { role: "user" | "assistant"; content: string };

function sanitize(messages: unknown): IncomingMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is IncomingMessage =>
        !!m &&
        typeof m === "object" &&
        (m as IncomingMessage).role !== undefined &&
        ["user", "assistant"].includes((m as IncomingMessage).role) &&
        typeof (m as IncomingMessage).content === "string" &&
        (m as IncomingMessage).content.trim().length > 0
    )
    // Keep the window short: this is a website chat, not a long session.
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

export async function POST(req: Request) {
  if (!withinRateLimit(clientIp(req))) {
    return Response.json(
      {
        error:
          "That's a lot of questions in a short time. Give it a few minutes, or call us and we'll talk it through.",
      },
      { status: 429 }
    );
  }

  const client = getClient();
  if (!client) {
    return Response.json(
      {
        // Phrased for a visitor, not an operator: never advertise that the
        // site is half-configured.
        error: `I'm not available right now, but our team is. Call us at ${PHONE_DISPLAY}.`,
      },
      { status: 503 }
    );
  }

  let messages: IncomingMessage[];
  let pageUrl: string | null = null;
  try {
    const body = await req.json();
    messages = sanitize(body?.messages);
    pageUrl =
      typeof body?.pageUrl === "string" ? body.pageUrl.slice(0, 500) : req.headers.get("referer");
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (messages.length === 0) {
    return Response.json({ error: "No message provided." }, { status: 400 });
  }

  try {
    const stream = client.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: MAX_TOKENS,
      // Chat is latency sensitive and the questions are not hard. Low effort
      // keeps replies fast and cheap without changing the model.
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: buildSystemPrompt(),
          // The briefing is identical on every request, so cache it: roughly
          // 90% cheaper on the repeat reads that make up all real traffic.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages,
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        /*
         * See lib/chat/sanitize.ts for why the cleaning happens against the
         * whole accumulated reply with a held-back tail, rather than per
         * delta. That logic lives in a module so it can be tested directly.
         */
        const cleaner = createStreamCleaner();

        // Accumulated cleaned reply, used only for lead extraction after the
        // response has been sent.
        let reply = "";

        const emit = (chunk: string) => {
          if (chunk) {
            reply += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        };

        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              emit(cleaner.push(event.delta.text));
            }
          }
          emit(cleaner.end());
          const final = await stream.finalMessage();
          // A safety decline returns HTTP 200, so check before trusting output.
          if (final.stop_reason === "refusal") {
            controller.enqueue(
              encoder.encode(
                `\n\nI am not able to help with that one. Call us at ${PHONE_DISPLAY} and someone from our team will point you the right way.`
              )
            );
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              "\n\nSomething went wrong on our end. Please call us and we will pick up."
            )
          );
        } finally {
          controller.close();

          /*
           * Lead capture runs after the visitor already has their reply, so it
           * can never slow or break the stream. Most turns carry no contact
           * details and are filtered out before any model call.
           */
          waitUntil(
            extractAndCreateLead(
              [...messages, { role: "assistant" as const, content: reply }],
              { pageUrl }
            ).catch(() => null)
          );
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json(
      { error: "The assistant is unavailable right now." },
      { status: 502 }
    );
  }
}
