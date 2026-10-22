import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/red-rose-knowledge";
import { createStreamCleaner } from "@/lib/chat/sanitize";
import { bearerMatches, readLiveAvatarKey } from "@/lib/liveavatar";

/**
 * An OpenAI chat-completions shaped endpoint, answered by Claude.
 *
 * LiveAvatar's FULL mode accepts a "custom LLM" as long as it speaks the
 * OpenAI protocol. Pointing it here means the live avatar is answered by the
 * same model, with the same system prompt, as the text chat. LiveAvatar's own
 * persona and system message are discarded on purpose: the Red Rose briefing
 * is the only thing allowed to state facts.
 *
 * Only LiveAvatar may call it. It authenticates with a bearer derived from
 * the LiveAvatar API key (see llmBearer), so the endpoint costs nothing to an
 * outsider who finds it.
 */

/** Spoken replies should be short. Generous for honest use, a ceiling for the rest. */
const MAX_TOKENS = 400;

/**
 * Appended to the normal briefing. The briefing was written for a chat
 * window; a spoken answer from a face on screen has different constraints,
 * and none of them loosen any fence above.
 */
const VOICE_ADDENDUM = `
## This conversation is spoken aloud
You are speaking through a live video avatar. The visitor hears you; they do not read you.
- Answer in one to three short spoken sentences. Never use lists, headings, markdown or emoji.
- Never read out a web address. To book, say "book a time on the contact page".
- Say the phone number as "nine four one, two oh six, four seven oh nine".
- Do not describe yourself as having a face, a body, or a location. You are Ava, Red Rose's AI assistant.
- If the visitor has not said anything yet, greet them in one sentence and ask where their practice is losing time.`;

type OpenAIMessage = {
  role: "system" | "user" | "assistant" | "tool" | "developer";
  content: unknown;
};

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => (p && typeof p === "object" && "text" in p ? String((p as { text: unknown }).text ?? "") : ""))
      .join("");
  }
  return "";
}

function toAnthropic(messages: OpenAIMessage[]): Anthropic.MessageParam[] {
  const turns: Anthropic.MessageParam[] = [];
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const text = textOf(m.content).trim().slice(0, 4000);
    if (!text) continue;
    const last = turns[turns.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content as string}\n${text}`;
    } else {
      turns.push({ role: m.role, content: text });
    }
  }
  while (turns.length && turns[0].role !== "user") turns.shift();
  const window = turns.slice(-20);
  while (window.length && window[0].role !== "user") window.shift();
  return window.length
    ? window
    : [{ role: "user", content: "(The visitor has just started a voice conversation and has not spoken yet.)" }];
}

function chunk(id: string, created: number, delta: Record<string, unknown>, finish: string | null) {
  return `data: ${JSON.stringify({
    id,
    object: "chat.completion.chunk",
    created,
    model: "ava",
    choices: [{ index: 0, delta, finish_reason: finish }],
  })}\n\n`;
}

export async function handleChatCompletions(req: Request): Promise<Response> {
  const laKey = readLiveAvatarKey();
  if (!laKey || !bearerMatches(req.headers.get("authorization"), laKey)) {
    return Response.json({ error: { message: "unauthorized" } }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ error: { message: "unavailable" } }, { status: 503 });

  let body: { messages?: OpenAIMessage[]; stream?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: { message: "bad request" } }, { status: 400 });
  }

  const messages = toAnthropic(Array.isArray(body.messages) ? body.messages : []);
  const client = new Anthropic({ apiKey });
  const id = `chatcmpl-${crypto.randomUUID()}`;
  const created = Math.floor(Date.now() / 1000);

  const params: Anthropic.MessageCreateParamsStreaming = {
    model: "claude-opus-5-5",
    max_tokens: MAX_TOKENS,
    // Spoken latency is the whole experience. Low effort keeps the first
    // word fast without changing the model or the fences.
    output_config: { effort: "low" },
    system: [
      { type: "text", text: buildSystemPrompt(), cache_control: { type: "ephemeral" } },
      { type: "text", text: VOICE_ADDENDUM },
    ],
    messages,
    stream: true,
  };

  const fallback = "Sorry, I lost my train of thought. You can reach Ron directly at nine four one, two oh six, four seven oh nine.";

  if (!body.stream) {
    let text = "";
    try {
      const cleaner = createStreamCleaner();
      const stream = client.messages.stream(params);
      for await (const ev of stream) {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") text += cleaner.push(ev.delta.text);
      }
      text += cleaner.end();
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal" || !text.trim()) text = fallback;
    } catch {
      text = fallback;
    }
    return Response.json({
      id,
      object: "chat.completion",
      created,
      model: "ava",
      choices: [{ index: 0, message: { role: "assistant", content: text.trim() }, finish_reason: "stop" }],
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      send(chunk(id, created, { role: "assistant", content: "" }, null));
      let said = "";
      try {
        const cleaner = createStreamCleaner();
        const upstream = client.messages.stream(params);
        for await (const ev of upstream) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            const piece = cleaner.push(ev.delta.text);
            if (piece) {
              said += piece;
              send(chunk(id, created, { content: piece }, null));
            }
          }
        }
        const tail = cleaner.end();
        if (tail) {
          said += tail;
          send(chunk(id, created, { content: tail }, null));
        }
        const final = await upstream.finalMessage();
        if (final.stop_reason === "refusal" || !said.trim()) {
          send(chunk(id, created, { content: (said ? " " : "") + fallback }, null));
        }
      } catch {
        send(chunk(id, created, { content: (said ? " " : "") + fallback }, null));
      } finally {
        send(chunk(id, created, {}, "stop"));
        send("data: [DONE]\n\n");
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
