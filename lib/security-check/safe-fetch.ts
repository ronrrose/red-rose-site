import http from "node:http";
import https from "node:https";
import { lookup as dnsLookup } from "node:dns/promises";
import zlib from "node:zlib";
import type { TLSSocket, PeerCertificate } from "node:tls";
import type { IncomingHttpHeaders } from "node:http";
import { parseTarget } from "@/lib/security-check/target";
import { isBlockedAddress } from "@/lib/security-check/ip";

/**
 * The only way the scanner talks to the network over HTTP.
 *
 * SSRF fences, in order, at every hop:
 *   1. The URL must be http or https on the default port, with no
 *      credentials, and its hostname must pass parseTarget (so no IP literal).
 *   2. We resolve the name ourselves and refuse it if ANY address it returns
 *      is private, loopback, link-local, CGNAT, multicast or reserved.
 *   3. The socket connects to the exact address we vetted. Node's own DNS is
 *      never consulted for the connection, so a second answer (DNS rebinding)
 *      cannot swap in another address. TLS still verifies the certificate
 *      against the hostname, and the Host header is the hostname.
 *   4. At most 3 redirects, each one re-vetted from step 1.
 *   5. Short timeouts, a hard deadline per request, and a byte cap on the
 *      body before and after decompression.
 *
 * Only GET and HEAD exist. Nothing here ever sends a body, a cookie or a
 * credential, and nothing fetched is ever rendered: callers get bytes.
 */

export const SCANNER_USER_AGENT =
  "RedRoseSecurityCheck/1.0 (+https://www.redrosetechnologies.com/free-security-check)";

export const MAX_REDIRECTS = 3;
export const DEFAULT_TIMEOUT_MS = 8000;
export const DEFAULT_MAX_BYTES = 1_000_000;

export type Method = "GET" | "HEAD";

export type ResolvedAddress = { address: string; family: 4 | 6 };

/** Injection points. Production uses the defaults; tests replace them. */
export type NetDeps = {
  resolve: (host: string) => Promise<ResolvedAddress[]>;
  isBlocked: (address: string) => boolean;
  /** Port to dial. Always 80/443 in production; tests point at a local server. */
  portFor: (protocol: "http:" | "https:") => number;
};

export const defaultDeps: NetDeps = {
  resolve: async (host) => {
    const all = await dnsLookup(host, { all: true, verbatim: true });
    return all.map((a) => ({ address: a.address, family: a.family === 6 ? 6 : 4 }));
  },
  isBlocked: isBlockedAddress,
  portFor: (protocol) => (protocol === "https:" ? 443 : 80),
};

export type RefusalCode =
  | "bad_url"
  | "bad_scheme"
  | "credentials"
  | "port"
  | "bad_host"
  | "dns_failed"
  | "no_address"
  | "blocked_address"
  | "too_many_redirects";

export class RefusedError extends Error {
  constructor(public code: RefusalCode, message: string) {
    super(message);
    this.name = "RefusedError";
  }
}

export type TlsInfo = {
  authorized: boolean;
  authorizationError: string | null;
  validFrom: string | null;
  validTo: string | null;
};

export type HopResponse = {
  url: string;
  method: Method;
  status: number;
  headers: IncomingHttpHeaders;
  body: Buffer;
  truncated: boolean;
  address: string;
  tls: TlsInfo | null;
};

export type RequestLogEntry = {
  method: Method | "DNS";
  url: string;
  status: number | null;
  error?: string;
};

export type FetchOptions = {
  method?: Method;
  timeoutMs?: number;
  maxBytes?: number;
  /** false only for the second, read-only look at a site with a broken certificate. */
  verifyTls?: boolean;
  /** Epoch ms after which no new request starts and running ones are cut short. */
  deadlineAt?: number;
  deps?: NetDeps;
  log?: RequestLogEntry[];
};

/** Vet a URL string without touching the network. */
export function vetUrl(raw: string, base?: string): URL {
  let url: URL;
  try {
    url = base ? new URL(raw, base) : new URL(raw);
  } catch {
    throw new RefusedError("bad_url", "Not a valid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new RefusedError("bad_scheme", `Refused scheme ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new RefusedError("credentials", "Refused URL with credentials");
  }
  // WHATWG URL drops a default port, so any port left here is a custom one.
  if (url.port !== "") {
    throw new RefusedError("port", `Refused custom port ${url.port}`);
  }
  const target = parseTarget(url.hostname);
  if (!target.ok || target.host !== url.hostname) {
    throw new RefusedError("bad_host", `Refused host (${target.ok ? "mismatch" : target.reason})`);
  }
  return url;
}

export const DNS_TIMEOUT_MS = 3000;

/** Resolve and vet. Refuses if any answer is not public. Returns the address to pin. */
export async function resolvePublic(
  host: string,
  deps: NetDeps = defaultDeps,
  timeoutMs: number = DNS_TIMEOUT_MS
): Promise<ResolvedAddress> {
  let answers: ResolvedAddress[];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A slow nameserver must not stretch the scan past its budget.
    answers = await Promise.race([
      deps.resolve(host),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("dns timeout")), Math.max(100, timeoutMs));
      }),
    ]);
  } catch {
    throw new RefusedError("dns_failed", "The name did not resolve");
  } finally {
    clearTimeout(timer);
  }
  if (!answers.length) throw new RefusedError("no_address", "The name has no address");
  const bad = answers.find((a) => deps.isBlocked(a.address));
  if (bad) {
    throw new RefusedError("blocked_address", "The name resolves to a private or reserved address");
  }
  return answers.find((a) => a.family === 4) ?? answers[0];
}

/** One request to one vetted URL. Never follows redirects. */
export async function requestOnce(rawUrl: string, opts: FetchOptions = {}): Promise<HopResponse> {
  const deps = opts.deps ?? defaultDeps;
  const method = opts.method ?? "GET";
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const url = vetUrl(rawUrl);
  const left = () => (opts.deadlineAt ? opts.deadlineAt - Date.now() : Infinity);
  if (left() < 300) throw new Error("timeout");
  const pinned = await resolvePublic(url.hostname, deps, Math.min(DNS_TIMEOUT_MS, left()));
  // Worked out after DNS, so lookup time comes out of the same budget.
  const remaining = left();
  if (remaining < 300) throw new Error("timeout");
  const timeoutMs = Math.min(opts.timeoutMs ?? DEFAULT_TIMEOUT_MS, remaining);
  const isHttps = url.protocol === "https:";
  const mod = isHttps ? https : http;

  return new Promise<HopResponse>((resolve, reject) => {
    let settled = false;
    let teardown: () => void = () => undefined;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      fn();
      teardown();
    };

    const req = mod.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: deps.portFor(url.protocol as "http:" | "https:"),
        path: url.pathname + url.search,
        method,
        agent: false,
        timeout: timeoutMs,
        headers: {
          Host: url.host,
          "User-Agent": SCANNER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "close",
        },
        // Pin the socket to the address we vetted. Handles both callback
        // shapes Node uses (single address, or all: true for autoSelectFamily).
        lookup: ((
          _hostname: string,
          options: { all?: boolean },
          cb: (err: Error | null, address: unknown, family?: number) => void
        ) => {
          if (options && options.all) cb(null, [{ address: pinned.address, family: pinned.family }]);
          else cb(null, pinned.address, pinned.family);
        }) as never,
        ...(isHttps ? { servername: url.hostname, rejectUnauthorized: opts.verifyTls !== false } : {}),
      },
      (res) => {
        let tls: TlsInfo | null = null;
        if (isHttps) {
          const sock = res.socket as TLSSocket;
          let cert: PeerCertificate | null = null;
          try {
            cert = sock.getPeerCertificate();
          } catch {
            cert = null;
          }
          tls = {
            authorized: sock.authorized === true,
            authorizationError: sock.authorizationError ? String(sock.authorizationError) : null,
            validFrom: cert && cert.valid_from ? cert.valid_from : null,
            validTo: cert && cert.valid_to ? cert.valid_to : null,
          };
        }

        const base = {
          url: url.toString(),
          method,
          status: res.statusCode ?? 0,
          headers: res.headers,
          address: pinned.address,
          tls,
        };

        if (method === "HEAD") {
          res.resume();
          finish(() => resolve({ ...base, body: Buffer.alloc(0), truncated: false }));
          req.destroy();
          return;
        }

        const encoding = String(res.headers["content-encoding"] ?? "").toLowerCase().trim();
        let stream: NodeJS.ReadableStream = res;
        if (encoding === "gzip" || encoding === "x-gzip") stream = res.pipe(zlib.createGunzip());
        else if (encoding === "deflate") stream = res.pipe(zlib.createInflate());
        else if (encoding === "br") stream = res.pipe(zlib.createBrotliDecompress());

        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        const done = () =>
          finish(() => resolve({ ...base, body: Buffer.concat(chunks), truncated }));

        // Tear down the response and any decompressor once we are done, so a
        // stream cannot keep working after the cap or the timeout.
        teardown = () => {
          if (stream !== res) (stream as unknown as { destroy?: () => void }).destroy?.();
          res.destroy();
          req.destroy();
        };

        // Cap what comes over the wire too, not only what decompresses, so a
        // stream of empty compressed blocks cannot run until the timeout.
        let rawSize = 0;
        if (stream !== res) res.on("data", (chunk: Buffer) => {
          rawSize += chunk.length;
          if (rawSize > maxBytes) {
            truncated = true;
            done();
          }
        });

        stream.on("data", (chunk: Buffer) => {
          if (truncated) return;
          const room = maxBytes - size;
          if (chunk.length >= room) {
            chunks.push(chunk.subarray(0, room));
            size = maxBytes;
            truncated = true;
            done();
            req.destroy();
            return;
          }
          chunks.push(chunk);
          size += chunk.length;
        });
        stream.on("end", done);
        stream.on("error", () => done());
        res.on("aborted", () => done());
      }
    );

    const deadline = setTimeout(() => {
      finish(() => reject(new Error("timeout")));
      req.destroy();
    }, timeoutMs + 500);

    req.on("timeout", () => {
      finish(() => reject(new Error("timeout")));
      req.destroy();
    });
    req.on("error", (err: NodeJS.ErrnoException) => {
      finish(() => reject(err));
    });
    req.end();
  });
}

export type FollowResult = {
  hops: HopResponse[];
  final: HopResponse;
};

/**
 * GET (or HEAD) a URL, following at most MAX_REDIRECTS redirects, re-vetting
 * every hop. Every request made, refused or failed is appended to opts.log.
 */
export async function fetchFollow(
  rawUrl: string,
  opts: FetchOptions & { maxRedirects?: number } = {}
): Promise<FollowResult> {
  const maxRedirects = Math.min(opts.maxRedirects ?? MAX_REDIRECTS, MAX_REDIRECTS);
  const hops: HopResponse[] = [];
  let current = rawUrl;

  for (let i = 0; ; i++) {
    let hop: HopResponse;
    try {
      hop = await requestOnce(current, opts);
    } catch (err) {
      opts.log?.push({
        method: opts.method ?? "GET",
        url: current,
        status: null,
        error: err instanceof RefusedError ? `refused: ${err.code}` : errorCode(err),
      });
      throw err;
    }
    opts.log?.push({ method: hop.method, url: hop.url, status: hop.status });
    hops.push(hop);

    const location = hop.headers.location;
    const isRedirect = [301, 302, 303, 307, 308].includes(hop.status) && typeof location === "string";
    if (!isRedirect) return { hops, final: hop };
    if (i >= maxRedirects) {
      throw new RefusedError("too_many_redirects", `More than ${maxRedirects} redirects`);
    }
    // Resolve relative to the current hop, then vet before the next request.
    const next = vetUrl(location as string, hop.url);
    current = next.toString();
  }
}

/** A short, stable error code for logs and for classifying TLS failures. */
export function errorCode(err: unknown): string {
  if (err instanceof RefusedError) return err.code;
  const e = err as NodeJS.ErrnoException | undefined;
  if (e?.code) return e.code;
  if (e?.message === "timeout") return "TIMEOUT";
  return "ERROR";
}

const TLS_ERROR_CODES = new Set([
  "CERT_HAS_EXPIRED",
  "CERT_NOT_YET_VALID",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_GET_ISSUER_CERT",
  "ERR_TLS_CERT_ALTNAME_INVALID",
  "CERT_REVOKED",
  "CERT_UNTRUSTED",
  "CERT_SIGNATURE_FAILURE",
  "HOSTNAME_MISMATCH",
]);

export function isTlsCertError(err: unknown): boolean {
  return TLS_ERROR_CODES.has(errorCode(err));
}
