import { createSessionToken, LiveAvatarError, readLiveAvatarKey } from "@/lib/liveavatar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Issues a short lived LiveAvatar session token to the browser. The API key
 * never leaves the server.
 *
 * Every token starts a session billed by the minute, and this route is
 * public, so it is the most expensive thing on the site to leave open. The
 * limits are tighter than chat or speech: a real visitor opens one session,
 * maybe two. Sessions themselves are capped at five minutes in
 * lib/liveavatar.ts. As with the other routes this counter is per-instance;
 * the durable control is a Vercel firewall rate-limit rule on this path.
 */
const WINDOW_MS = 10 * 60 * 1000;
const WINDOW_MAX = 3;
const HOUR_MS = 60 * 60 * 1000;
const HOUR_MAX = 8;

const hitsByIp = new Map<string, number[]>();

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (hitsByIp.get(ip) || []).filter((t) => t > now - HOUR_MS);
  hits.push(now);
  hitsByIp.set(ip, hits);
  if (hitsByIp.size > 5000) {
    hitsByIp.forEach((times: number[], key: string) => {
      if (times.every((t: number) => t <= now - HOUR_MS)) hitsByIp.delete(key);
    });
  }
  const recent = hits.filter((t) => t > now - WINDOW_MS).length;
  return recent <= WINDOW_MAX && hits.length <= HOUR_MAX;
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/**
 * Lets the page decide, without spending anything, whether to offer live mode.
 *
 * With ?check=1 it also confirms the setup end to end: that the key is valid
 * and an avatar of Ava exists in the account. Listing avatars is free, but it
 * is a network call, so it only runs on request rather than on every page view.
 * Reports booleans and the avatar's name only, never any credential.
 */
export async function GET(req: Request) {
  const apiKey = readLiveAvatarKey();
  const configured = !!apiKey;
  if (!configured || new URL(req.url).searchParams.get("check") !== "1") {
    return Response.json({ configured });
  }
  try {
    const res = await fetch("https://api.liveavatar.com/v1/avatars?page_size=100", {
      headers: { "X-API-KEY": apiKey!, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ configured, keyValid: false, upstream: res.status });
    const json = (await res.json()) as { data?: { results?: { name: string; status?: string }[] } };
    const active = (json.data?.results || []).filter((a) => (a.status || "ACTIVE") === "ACTIVE");
    const ava = active.find((a) => /\bava\b/i.test(a.name)) || active[0];
    return Response.json({
      configured,
      keyValid: true,
      avatar: ava ? ava.name : null,
      avatarsInAccount: (json.data?.results || []).map((a) => `${a.name} (${a.status || "?"})`),
    });
  } catch {
    return Response.json({ configured, keyValid: false });
  }
}

export async function POST(req: Request) {
  const apiKey = readLiveAvatarKey();
  if (!apiKey) return Response.json({ error: "not_configured" }, { status: 503 });

  if (!withinRateLimit(clientIp(req))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const token = await createSessionToken(apiKey);
    return Response.json(token, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // Report which step failed, never any credential. These codes are what
    // makes a failed live session diagnosable from the outside.
    if (e instanceof LiveAvatarError) {
      const reason = e.message === "no_avatar" ? "no_avatar" : "upstream";
      console.error("liveavatar token failed:", e.message, e.status, e.detail.slice(0, 500));
      return Response.json(
        { error: reason, step: e.message, upstream: e.status },
        { status: reason === "no_avatar" ? 409 : 502 }
      );
    }
    console.error("liveavatar token failed:", e);
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
