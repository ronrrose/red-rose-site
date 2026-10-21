import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/red-rose-knowledge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Chat replies are short by instruction; this is a ceiling, not a target. */
const MAX_TOKENS = 2048;

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
  const client = getClient();
  if (!client) {
    return Response.json(
      {
        error:
          "The assistant is not configured yet. Please call us and we will help you directly.",
      },
      { status: 503 }
    );
  }

  let messages: IncomingMessage[];
  try {
    const body = await req.json();
    messages = sanitize(body?.messages);
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
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          // A safety decline returns HTTP 200, so check before trusting output.
          if (final.stop_reason === "refusal") {
            controller.enqueue(
              encoder.encode(
                "\n\nI am not able to help with that one. Give Ron a call and he will point you the right way."
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
