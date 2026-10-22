/**
 * Quo REST client.
 *
 * Two API versions are live and we use both, deliberately:
 *
 *   - "2026-03-30" (the dated version) for contacts, contact notes and
 *     properties, calls, webhooks and the A2P registration. It is the only
 *     version with first-class notes, typed properties, a unified webhook
 *     endpoint and a readable 10DLC status.
 *   - "v1" for exactly one thing: sending a text message. The dated version
 *     has no send endpoint, so POST /v1/messages remains the only way.
 *
 * Base URL is api.quo.com. The old api.openphone.com host predates the
 * rename; both OpenAPI specs now declare api.quo.com as the production
 * server, so that is what we call.
 */

const BASE_URL = "https://api.quo.com";
const API_VERSION = "2026-03-30";

/** Documented limit: 10 requests per second per key. */
const RATE_LIMIT_PER_SECOND = 10;
const RATE_WINDOW_MS = 1000;

const MAX_ATTEMPTS = 4;

export class QuoError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "QuoError";
    this.status = status;
    this.code = code;
  }

  /** Worth retrying: rate limited, or a transient server fault. */
  get retryable(): boolean {
    return this.status === 429 || this.status >= 500;
  }
}

/**
 * Client-side throttle.
 *
 * The limit is per key, and every instance of this function shares one key,
 * so a single serverless instance going fast is enough to trip it. The queue
 * turns a burst into a line, and a line never sees a 429. It cannot coordinate
 * across instances, which is why the backoff below still exists.
 */
const recentCalls: number[] = [];

async function throttle(): Promise<void> {
  for (;;) {
    const now = Date.now();
    while (recentCalls.length > 0 && recentCalls[0] <= now - RATE_WINDOW_MS) {
      recentCalls.shift();
    }
    if (recentCalls.length < RATE_LIMIT_PER_SECOND) {
      recentCalls.push(now);
      return;
    }
    const waitMs = recentCalls[0] + RATE_WINDOW_MS - now;
    await sleep(Math.max(waitMs, 10));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey(): string | null {
  // Server-side only. There is no NEXT_PUBLIC_ fallback by design: that
  // prefix would inline the key into the client bundle.
  return process.env.QUO_API_KEY || null;
}

export function isQuoConfigured(): boolean {
  return Boolean(getApiKey());
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  /** Pass "v1" only for endpoints the dated version does not expose. */
  version?: "2026-03-30" | "v1";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

/**
 * Make one authenticated Quo request, with throttling and backoff.
 *
 * Never logs the key, the Authorization header, or a full response body: a
 * Quo payload contains customer phone numbers and message text.
 */
export async function quoFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const key = getApiKey();
  if (!key) throw new QuoError("QUO_API_KEY is not configured", 0);

  const version = options.version ?? API_VERSION;
  const prefix = version === "v1" ? "/v1" : "";
  const url = new URL(`${BASE_URL}${prefix}${path}`);

  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    // No "Bearer" prefix: Quo takes the raw key.
    Authorization: key,
    Accept: "application/json",
  };
  // The version header is required on the dated API and rejected as unknown
  // on v1, so send it only where it belongs.
  if (version !== "v1") headers["Quo-Api-Version"] = version;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let lastError: QuoError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await throttle();

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: "no-store",
      });
    } catch (cause) {
      // Network-level failure. Treat as retryable.
      lastError = new QuoError(
        `Quo request failed: ${cause instanceof Error ? cause.message : "network error"}`,
        0
      );
      if (attempt === MAX_ATTEMPTS) throw lastError;
      await sleep(backoffMs(attempt, undefined));
      continue;
    }

    if (res.ok) {
      if (res.status === 204) return undefined as T;
      const text = await res.text();
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    }

    const detail = await safeErrorDetail(res);
    const error = new QuoError(
      `Quo ${options.method ?? "GET"} ${path} failed with ${res.status}${
        detail ? `: ${detail}` : ""
      }`,
      res.status,
      detail
    );

    if (!error.retryable || attempt === MAX_ATTEMPTS) throw error;
    lastError = error;
    await sleep(backoffMs(attempt, res.headers.get("retry-after")));
  }

  throw lastError ?? new QuoError("Quo request failed", 0);
}

/** Exponential backoff with jitter, honouring Retry-After when present. */
function backoffMs(attempt: number, retryAfter: string | null | undefined): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, 10_000);
    }
  }
  const base = Math.min(250 * 2 ** (attempt - 1), 4_000);
  return base + Math.random() * 250;
}

/**
 * Pull the error code out of Quo's error envelope without letting a body we
 * failed to parse become an exception of its own.
 */
async function safeErrorDetail(res: Response): Promise<string | undefined> {
  try {
    const text = await res.text();
    if (!text) return undefined;
    const parsed = JSON.parse(text) as {
      message?: string;
      code?: string;
      error?: { message?: string; code?: string };
    };
    const code = parsed.code ?? parsed.error?.code;
    const message = parsed.message ?? parsed.error?.message;
    // Code first: it is stable and carries no customer data.
    return code ?? (message ? message.slice(0, 200) : undefined);
  } catch {
    return undefined;
  }
}
