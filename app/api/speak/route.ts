export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Text to speech for Ava, so she answers in the same voice as the recorded
 * greeting instead of the visitor's browser voice.
 *
 * This endpoint spends money on every call, billed per character, and it is
 * public. That makes it a more attractive target than /api/chat: there is no
 * model to refuse anything, just a meter. So the limits below are deliberately
 * tighter than the chat route's, and the character cap matters as much as the
 * request cap. A reply from Ava is two to four sentences by instruction, so
 * 900 characters is generous for honest traffic and a hard ceiling for the
 * rest.
 *
 * As with /api/chat this counter is per-instance and resets on cold start, so
 * it is a speed bump rather than a wall. The durable fix is a rate-limit rule
 * at the Vercel firewall, in front of the function.
 */
const MAX_CHARS = 900;
const BURST_WINDOW_MS = 5 * 60 * 1000;
const BURST_MAX = 20;
const HOUR_WINDOW_MS = 60 * 60 * 1000;
const HOUR_MAX = 80;

const hitsByIp = new Map<string, number[]>();

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (hitsByIp.get(ip) || []).filter((t) => t > now - HOUR_WINDOW_MS);
  hits.push(now);
  hitsByIp.set(ip, hits);

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
 * Resolve which voice to speak with, once per instance.
 *
 * ELEVENLABS_VOICE_ID wins when set. Otherwise the account's own voice list is
 * searched for the one used in the recorded greeting, so the live answer and
 * the greeting match without anyone having to paste an ID anywhere.
 */
const GREETING_VOICE_NAME = "lauren parker";
let cachedVoiceId: string | null = null;

async function resolveVoiceId(apiKey: string): Promise<string | null> {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;
  if (cachedVoiceId) return cachedVoiceId;

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      voices?: { voice_id: string; name?: string; labels?: Record<string, string> }[];
    };
    const voices = data.voices || [];
    if (voices.length === 0) return null;

    const byName = voices.find(
      (v) => (v.name || "").trim().toLowerCase() === GREETING_VOICE_NAME
    );
    const byFirstName = voices.find((v) =>
      (v.name || "").toLowerCase().includes("lauren")
    );
    const female = voices.find(
      (v) => (v.labels?.gender || "").toLowerCase() === "female"
    );

    cachedVoiceId = (byName || byFirstName || female || voices[0]).voice_id;
    return cachedVoiceId;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!withinRateLimit(clientIp(req))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  // No key is not an error the visitor should see: the client falls back to
  // the browser voice and the conversation carries on.
  if (!apiKey) return Response.json({ error: "unavailable" }, { status: 503 });

  let text = "";
  try {
    const body = (await req.json()) as { text?: unknown };
    if (typeof body.text === "string") text = body.text.trim();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  if (!text) return Response.json({ error: "bad_request" }, { status: 400 });
  text = text.slice(0, MAX_CHARS);

  const voiceId = await resolveVoiceId(apiKey);
  if (!voiceId) return Response.json({ error: "unavailable" }, { status: 503 });

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok || !res.body) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
