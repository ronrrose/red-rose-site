import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server side plumbing for Ava's live, lip-synced avatar (HeyGen LiveAvatar).
 *
 * The division of labour:
 * - LiveAvatar owns the face, the lip sync, speech recognition and the
 *   spoken voice, streamed to the visitor over WebRTC.
 * - Red Rose owns what she says. LiveAvatar is pointed at an OpenAI shaped
 *   endpoint on this site (/api/liveavatar/llm), which answers with the same
 *   Claude agent and the same system prompt as the text chat. Every honesty
 *   fence in lib/red-rose-knowledge.ts therefore applies to the live avatar
 *   without being rewritten for it.
 *
 * Only LIVEAVATAR_API_KEY is required. Everything else LiveAvatar needs (the
 * secret it calls back with, the LLM configuration) is provisioned from it on
 * first use, so nobody has to paste IDs between dashboards.
 */

const API = "https://api.liveavatar.com";

/**
 * The public origin LiveAvatar calls back to. Deliberately not derived from
 * the incoming request: preview deployments sit behind Vercel authentication,
 * so LiveAvatar could never reach a callback URL built from one.
 */
export const PUBLIC_ORIGIN =
  process.env.LIVEAVATAR_PUBLIC_ORIGIN || "https://www.redrosetechnologies.com";

export function readLiveAvatarKey(): string | undefined {
  const v = process.env.LIVEAVATAR_API_KEY || process.env.HEYGEN_LIVEAVATAR_API_KEY;
  return v && v.trim() ? v.trim() : undefined;
}

/**
 * The bearer LiveAvatar presents when it calls our LLM endpoint.
 *
 * Derived from the API key rather than stored, so there is no second secret
 * to manage and rotating the API key rotates this too. The suffix tags the
 * provisioned records, so a rotated key provisions fresh ones instead of
 * reusing records holding the old bearer.
 */
export function llmBearer(apiKey: string): string {
  return createHmac("sha256", apiKey).update("red-rose-ava-llm-v1").digest("hex");
}

function bearerTag(apiKey: string): string {
  return createHmac("sha256", llmBearer(apiKey)).update("tag").digest("hex").slice(0, 8);
}

export function bearerMatches(presented: string | null, apiKey: string): boolean {
  if (!presented) return false;
  const token = presented.replace(/^Bearer\s+/i, "").trim();
  const expected = llmBearer(apiKey);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Envelope<T> = { code?: number; message?: string; data?: T | null };

async function la<T>(apiKey: string, path: string, init: RequestInit = {}): Promise<T | null> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new LiveAvatarError(`${init.method || "GET"} ${path} -> ${res.status}`, res.status, detail);
  }
  const json = (await res.json()) as Envelope<T>;
  return json.data ?? null;
}

export class LiveAvatarError extends Error {
  constructor(message: string, readonly status: number, readonly detail: string) {
    super(message);
  }
}

/* ── LLM configuration ──────────────────────────────────────────────── */

let cachedLlmConfigId: string | null = null;

async function ensureLlmConfiguration(apiKey: string): Promise<string> {
  if (process.env.LIVEAVATAR_LLM_CONFIG_ID) return process.env.LIVEAVATAR_LLM_CONFIG_ID;
  if (cachedLlmConfigId) return cachedLlmConfigId;

  const tag = bearerTag(apiKey);
  const displayName = `Red Rose Ava (Claude) ${tag}`;

  const existing =
    (await la<{ id: string; display_name: string }[]>(apiKey, "/v1/llm-configurations")) || [];
  const found = existing.find((c) => c.display_name === displayName);
  if (found) return (cachedLlmConfigId = found.id);

  const secretName = `red-rose-ava-llm-${tag}`;
  const secrets =
    (await la<{ id: string; secret_name: string }[]>(apiKey, "/v1/secrets")) || [];
  let secretId = secrets.find((s) => s.secret_name === secretName)?.id;
  if (!secretId) {
    const created = await la<{ id: string }>(apiKey, "/v1/secrets", {
      method: "POST",
      body: JSON.stringify({
        secret_name: secretName,
        secret_value: llmBearer(apiKey),
        // Our endpoint speaks the OpenAI chat completions protocol, so it is
        // registered as an OpenAI style key. It is the bearer LiveAvatar will
        // present to us, not a real OpenAI key.
        secret_type: "OPENAI_API_KEY",
      }),
    });
    secretId = created?.id;
  }
  if (!secretId) throw new LiveAvatarError("secret not created", 500, "");

  const config = await la<{ id: string }>(apiKey, "/v1/llm-configurations", {
    method: "POST",
    body: JSON.stringify({
      display_name: displayName,
      model_name: "ava",
      secret_id: secretId,
      base_url: `${PUBLIC_ORIGIN}/api/liveavatar/llm`,
    }),
  });
  if (!config?.id) throw new LiveAvatarError("llm configuration not created", 500, "");
  return (cachedLlmConfigId = config.id);
}

/* ── Avatar and voice ───────────────────────────────────────────────── */

type Avatar = {
  id: string;
  name: string;
  type?: "IMAGE" | "VIDEO";
  status?: string;
  default_voice?: { id: string; name: string } | null;
};

let cachedAvatar: Avatar | null = null;

/**
 * Ava's own avatar, never a stock one.
 *
 * A stock LiveAvatar face would be a different woman from the one in the
 * greeting and on the chat button. So this only ever uses an avatar in Red
 * Rose's own account, preferring one named Ava, and reports "no_avatar"
 * rather than quietly substituting a stranger.
 */
async function resolveAvatar(apiKey: string): Promise<Avatar | null> {
  if (cachedAvatar) return cachedAvatar;
  const forced = process.env.LIVEAVATAR_AVATAR_ID;
  if (forced) {
    const a = await la<Avatar>(apiKey, `/v1/avatars/${encodeURIComponent(forced)}`);
    return (cachedAvatar = a ? a : { id: forced, name: "Ava" });
  }
  const page = await la<{ results: Avatar[] }>(apiKey, "/v1/avatars?page_size=100");
  const mine = (page?.results || []).filter((a) => (a.status || "ACTIVE") === "ACTIVE");
  const ava = mine.find((a) => /\bava\b/i.test(a.name)) || mine[0] || null;
  return (cachedAvatar = ava);
}

async function resolveVoiceId(apiKey: string, avatar: Avatar): Promise<string | undefined> {
  if (process.env.LIVEAVATAR_VOICE_ID) return process.env.LIVEAVATAR_VOICE_ID;
  if (avatar.default_voice?.id) return avatar.default_voice.id;

  // Image avatars ship without a voice, so one has to be chosen. Prefer the
  // account's own voices (a bound ElevenLabs voice lands here), then a public
  // female English voice.
  for (const voiceType of ["private", "public"] as const) {
    const page = await la<{ results: { id: string; name: string; language: string; gender: string }[] }>(
      apiKey,
      `/v1/voices?voice_type=${voiceType}&page_size=100`
    ).catch(() => null);
    const voices = page?.results || [];
    const pick =
      voices.find((v) => /lauren|ava/i.test(v.name)) ||
      voices.find((v) => /female/i.test(v.gender) && /^en/i.test(v.language)) ||
      (voiceType === "private" ? voices[0] : undefined);
    if (pick) return pick.id;
  }
  return undefined;
}

/* ── Session token ──────────────────────────────────────────────────── */

/** Sessions are billed per minute, so cap them. Ample for a site visit. */
const MAX_SESSION_SECONDS = 300;

export async function createSessionToken(apiKey: string): Promise<{ sessionToken: string; sessionId: string }> {
  const avatar = await resolveAvatar(apiKey);
  if (!avatar) throw new LiveAvatarError("no_avatar", 409, "");

  const [llmConfigId, voiceId] = await Promise.all([
    ensureLlmConfiguration(apiKey),
    resolveVoiceId(apiKey, avatar),
  ]);

  const data = await la<{ session_id: string; session_token: string }>(apiKey, "/v1/sessions/token", {
    method: "POST",
    body: JSON.stringify({
      mode: "FULL",
      avatar_id: avatar.id,
      is_sandbox: process.env.LIVEAVATAR_SANDBOX === "true",
      max_session_duration: MAX_SESSION_SECONDS,
      interactivity_type: "CONVERSATIONAL",
      llm_configuration_id: llmConfigId,
      video_settings: { quality: "high", encoding: "H264" },
      avatar_persona: {
        ...(voiceId ? { voice_id: voiceId } : {}),
        language: "en",
      },
    }),
  });
  if (!data?.session_token) throw new LiveAvatarError("no_token", 502, "");
  return { sessionToken: data.session_token, sessionId: data.session_id };
}
