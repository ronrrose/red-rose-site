import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import zlib from "node:zlib";
import { parseTarget, registrableDomain } from "@/lib/security-check/target";
import { isBlockedAddress } from "@/lib/security-check/ip";
import {
  RefusedError,
  fetchFollow,
  requestOnce,
  resolvePublic,
  vetUrl,
  type NetDeps,
  type RequestLogEntry,
} from "@/lib/security-check/safe-fetch";

/**
 * SSRF fences. Every refusal the brief's correction 1 asks for has a test
 * here. Network tests run against a local server only, through injected DNS
 * and port mapping, so nothing here touches the internet.
 */

describe("fence 1: only a bare public hostname is accepted", () => {
  const refused: Array<[string, string]> = [
    ["", "empty"],
    ["localhost", "single_label"],
    ["intranet", "single_label"],
    ["127.0.0.1", "ip_literal"],
    ["127.1", "ip_literal"],
    ["2130706433", "ip_literal"],
    ["0x7f.0.0.1", "ip_literal"],
    ["0177.0.0.1", "ip_literal"],
    ["169.254.169.254", "ip_literal"],
    ["[::1]", "ip_literal"],
    ["::1", "ip_literal"],
    ["http://[::ffff:127.0.0.1]/", "ip_literal"],
    ["fd00::1", "ip_literal"],
    ["example.com:8080", "has_port"],
    ["https://example.org:443", "has_port"],
    ["user:pass@smile.com", "has_credentials"],
    ["https://smile.com@127.0.0.1", "has_credentials"],
    ["smile.com/admin", "has_path"],
    ["smile.com?x=1", "has_path"],
    ["smile.com#a", "has_path"],
    ["file:///etc/passwd", "bad_scheme"],
    ["gopher://smile.com", "bad_scheme"],
    ["javascript:alert(1)", "bad_scheme"],
    ["ftp://smile.com", "bad_scheme"],
    ["//smile.com", "bad_scheme"],
    ["metadata.google.internal", "reserved_name"],
    ["printer.local", "reserved_name"],
    ["foo.localhost", "reserved_name"],
    ["router.home.arpa", "reserved_name"],
    ["test.example.com", "reserved_name"],
    ["smile .com", "bad_characters"],
    ["smile%2ecom", "bad_characters"],
    ["-smile.com", "bad_label"],
    ["smile-.com", "bad_label"],
    ["a".repeat(64) + ".com", "bad_label"],
  ];
  for (const [input, reason] of refused) {
    it(`refuses ${JSON.stringify(input)} (${reason})`, () => {
      const r = parseTarget(input);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe(reason);
    });
  }

  const accepted: Array<[string, string]> = [
    ["smiledental.com", "smiledental.com"],
    ["  SmileDental.COM  ", "smiledental.com"],
    ["https://www.smiledental.com/", "www.smiledental.com"],
    ["http://smiledental.com", "smiledental.com"],
    ["smiledental.com.", "smiledental.com"],
    ["dr-lee.dental", "dr-lee.dental"],
    ["bücher.de", "xn--bcher-kva.de"],
  ];
  for (const [input, host] of accepted) {
    it(`accepts ${JSON.stringify(input)} as ${host}`, () => {
      const r = parseTarget(input);
      expect(r.ok && r.host).toBe(host);
    });
  }
});

describe("the daily limit is keyed on the registrable domain", () => {
  it.each([
    ["www.smile.com", "smile.com"],
    ["a.b.smile.com", "smile.com"],
    ["www.smile.co.uk", "smile.co.uk"],
    ["clinic.bigstate.edu", "bigstate.edu"],
    ["practice.github.io", "practice.github.io"],
  ])("%s -> %s", (host, key) => expect(registrableDomain(host)).toBe(key));
});

describe("fence 2: private and reserved addresses are refused", () => {
  const blocked = [
    "0.0.0.0", "10.0.0.1", "100.64.0.1", "100.127.255.255", "127.0.0.1", "127.255.255.254",
    "169.254.169.254", "169.254.0.1", "172.16.0.1", "172.31.255.255", "192.0.0.8", "192.0.2.1",
    "192.88.99.1", "192.168.1.1", "198.18.0.1", "198.51.100.7", "203.0.113.9", "224.0.0.251",
    "239.255.255.250", "240.0.0.1", "255.255.255.255",
    "::", "::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1", "::ffff:169.254.169.254", "::127.0.0.1",
    "64:ff9b::a9fe:a9fe", "64:ff9b:1::1", "fc00::1", "fd12:3456::1", "fe80::1", "fe80::1%en0",
    "fec0::1", "ff02::1", "2001:db8::1", "2001::1", "2002:7f00:1::1", "2002:c0a8:101::1",
    "100::1", "3fff::1", "not-an-ip",
  ];
  for (const a of blocked) it(`blocks ${a}`, () => expect(isBlockedAddress(a)).toBe(true));

  const allowed = ["8.8.8.8", "1.1.1.1", "76.76.21.21", "172.32.0.1", "100.128.0.1", "2606:4700::1111", "2a00:1450:4001:80b::200e", "::ffff:8.8.8.8", "2002:808:808::1"];
  for (const a of allowed) it(`allows ${a}`, () => expect(isBlockedAddress(a)).toBe(false));
});

describe("fence 2: resolution is vetted before any connection", () => {
  const deps = (answers: Record<string, string[]>): NetDeps => ({
    resolve: async (h) => (answers[h] ?? []).map((address) => ({ address, family: address.includes(":") ? 6 : 4 })),
    isBlocked: isBlockedAddress,
    portFor: () => 9, // nothing listens; a connection attempt would error, not be refused
  });

  it("refuses a name that resolves to loopback", async () => {
    await expect(resolvePublic("evil.com", deps({ "evil.com": ["127.0.0.1"] }))).rejects.toMatchObject({ code: "blocked_address" });
  });
  it("refuses a name that resolves to cloud metadata", async () => {
    await expect(requestOnce("http://evil.com/", { deps: deps({ "evil.com": ["169.254.169.254"] }) })).rejects.toMatchObject({ code: "blocked_address" });
  });
  it("refuses a name that resolves to a private IPv6 address", async () => {
    await expect(requestOnce("https://evil.com/", { deps: deps({ "evil.com": ["fd00::5"] }) })).rejects.toMatchObject({ code: "blocked_address" });
  });
  it("refuses when ANY answer is private, even if another is public", async () => {
    await expect(resolvePublic("mixed.com", deps({ "mixed.com": ["8.8.8.8", "10.0.0.5"] }))).rejects.toMatchObject({ code: "blocked_address" });
  });
  it("refuses a name with no address", async () => {
    await expect(resolvePublic("none.com", deps({}))).rejects.toMatchObject({ code: "no_address" });
  });
});

describe("fence 1 at every hop: URL vetting", () => {
  const refusals: Array<[string, string]> = [
    ["http://127.0.0.1/", "bad_host"],
    ["http://[::1]/", "bad_host"],
    ["http://169.254.169.254/latest/meta-data/", "bad_host"],
    ["http://0x7f000001/", "bad_host"],
    ["http://2130706433/", "bad_host"],
    ["http://smile.com:8080/", "port"],
    ["https://smile.com:8443/", "port"],
    ["http://user:pw@smile.com/", "credentials"],
    ["file:///etc/passwd", "bad_scheme"],
    ["gopher://smile.com/", "bad_scheme"],
    ["http://metadata.google.internal/", "bad_host"],
  ];
  for (const [url, code] of refusals) {
    it(`refuses ${url} (${code})`, () => {
      try {
        vetUrl(url);
        throw new Error("not refused");
      } catch (e) {
        expect(e).toBeInstanceOf(RefusedError);
        expect((e as RefusedError).code).toBe(code);
      }
    });
  }
  it("keeps default ports (they are normalised away)", () => {
    expect(vetUrl("https://smile.com:443/").toString()).toBe("https://smile.com/");
  });
});

/* ── Against a local server ─────────────────────────────────────────────── */

type Hit = { method: string; url: string; host: string | undefined };
let server: http.Server;
let port = 0;
const hits: Hit[] = [];

beforeAll(async () => {
  server = http.createServer((req, res) => {
    hits.push({ method: req.method ?? "", url: req.url ?? "", host: req.headers.host });
    const u = req.url ?? "/";
    const redirect = (loc: string) => {
      res.writeHead(302, { Location: loc });
      res.end();
    };
    if (u === "/to-private-ip") return redirect("http://169.254.169.254/latest/meta-data/");
    if (u === "/to-private-name") return redirect("http://internal-target.com/");
    if (u === "/to-port") return redirect("http://site.com:8080/");
    if (u === "/to-creds") return redirect("http://admin:pw@site.com/");
    if (u === "/to-file") return redirect("file:///etc/passwd");
    if (u === "/to-v6-loopback") return redirect("http://[::1]/");
    if (u.startsWith("/loop")) return redirect(`/loop${Number(u.slice(5) || 0) + 1}`);
    if (u === "/relative") return redirect("/final");
    if (u === "/big") {
      res.writeHead(200, { "Content-Type": "text/html" });
      const chunk = Buffer.alloc(64 * 1024, 97);
      for (let i = 0; i < 40; i++) res.write(chunk);
      return res.end();
    }
    if (u === "/hang") return; // never answers
    if (u === "/gzip-bomb") {
      // Compresses about 1000:1, so a small cap on decoded bytes alone would let the wire run.
      res.writeHead(200, { "Content-Type": "text/html", "Content-Encoding": "gzip" });
      return res.end(zlib.gzipSync(Buffer.alloc(8 * 1024 * 1024, 0)));
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<html><body>ok</body></html>");
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  port = (server.address() as AddressInfo).port;
});

afterAll(() => {
  server.closeAllConnections?.();
  server.close();
});

/**
 * Test DNS: "site.com" and "rebind.com" point at the local server. For this
 * suite only, the local server's 127.0.0.1 is treated as public so we can
 * watch real sockets; every other private range stays blocked.
 */
function localDeps(extra: Record<string, string> = {}, counter?: { n: number }): NetDeps {
  const table: Record<string, string> = { "site.com": "127.0.0.1", "internal-target.com": "10.1.2.3", ...extra };
  return {
    resolve: async (h) => {
      if (counter) counter.n += 1;
      const a = table[h];
      return a ? [{ address: a, family: 4 }] : [];
    },
    isBlocked: (a) => (a === "127.0.0.1" ? false : isBlockedAddress(a)),
    portFor: () => port,
  };
}

describe("fence 4: every redirect hop is re-vetted", () => {
  const cases: Array<[string, string]> = [
    ["/to-private-ip", "bad_host"],
    ["/to-private-name", "blocked_address"],
    ["/to-port", "port"],
    ["/to-creds", "credentials"],
    ["/to-file", "bad_scheme"],
    ["/to-v6-loopback", "bad_host"],
  ];
  for (const [path, code] of cases) {
    it(`refuses the hop after ${path} (${code}) without connecting to it`, async () => {
      const before = hits.length;
      const log: RequestLogEntry[] = [];
      await expect(fetchFollow(`http://site.com${path}`, { deps: localDeps(), log })).rejects.toMatchObject({ code });
      // Only the first request reached the server; the bad hop never connected.
      expect(hits.length - before).toBe(1);
    });
  }

  it("follows at most 3 redirects", async () => {
    const before = hits.length;
    await expect(fetchFollow("http://site.com/loop0", { deps: localDeps() })).rejects.toMatchObject({ code: "too_many_redirects" });
    expect(hits.length - before).toBe(4); // the original plus 3 redirects
  });

  it("follows a relative redirect and logs each hop", async () => {
    const log: RequestLogEntry[] = [];
    const r = await fetchFollow("http://site.com/relative", { deps: localDeps(), log });
    expect(r.final.status).toBe(200);
    expect(log.map((l) => l.url)).toEqual(["http://site.com/relative", "http://site.com/final"]);
  });
});

describe("fence 3: the socket goes to the vetted address (DNS rebinding)", () => {
  it("resolves once per request and never asks Node's resolver", async () => {
    const counter = { n: 0 };
    const before = hits.length;
    // If Node did its own lookup, "rebind.com" would fail: it is not in any real DNS we control.
    const r = await requestOnce("http://rebind.com/", { deps: localDeps({ "rebind.com": "127.0.0.1" }, counter) });
    expect(r.status).toBe(200);
    expect(r.address).toBe("127.0.0.1");
    expect(counter.n).toBe(1);
    expect(hits[before].host).toBe("rebind.com");
  });

  it("a second, private answer cannot be swapped in after vetting", async () => {
    let call = 0;
    const deps: NetDeps = {
      resolve: async () => {
        call += 1;
        // First answer passes vetting; any later answer would be private.
        return [{ address: call === 1 ? "127.0.0.1" : "169.254.169.254", family: 4 }];
      },
      isBlocked: (a) => (a === "127.0.0.1" ? false : isBlockedAddress(a)),
      portFor: () => port,
    };
    const r = await requestOnce("http://rebind.com/", { deps });
    expect(r.address).toBe("127.0.0.1");
    expect(call).toBe(1);
  });
});

describe("fence 5: timeouts and byte caps", () => {
  it("caps the body and marks it truncated", async () => {
    const r = await requestOnce("http://site.com/big", { deps: localDeps(), maxBytes: 100_000 });
    expect(r.body.length).toBe(100_000);
    expect(r.truncated).toBe(true);
  });

  it("gives up on a server that never answers", async () => {
    const t = Date.now();
    await expect(requestOnce("http://site.com/hang", { deps: localDeps(), timeoutMs: 400 })).rejects.toBeTruthy();
    expect(Date.now() - t).toBeLessThan(3000);
  });

  it("caps a decompression bomb", async () => {
    const r = await requestOnce("http://site.com/gzip-bomb", { deps: localDeps(), maxBytes: 200_000 });
    expect(r.body.length).toBeLessThanOrEqual(200_000);
    expect(r.truncated).toBe(true);
  });

  it("gives up on a DNS answer that never comes", async () => {
    const slow: NetDeps = { ...localDeps(), resolve: () => new Promise(() => undefined) };
    const t = Date.now();
    await expect(requestOnce("http://site.com/", { deps: slow, deadlineAt: Date.now() + 600 })).rejects.toMatchObject({ code: "dns_failed" });
    expect(Date.now() - t).toBeLessThan(1500);
  });

  it("respects the overall scan deadline", async () => {
    await expect(requestOnce("http://site.com/", { deps: localDeps(), deadlineAt: Date.now() + 100 })).rejects.toThrow("timeout");
  });
});

describe("only GET and HEAD are ever sent", () => {
  it("all requests in this suite used GET or HEAD", async () => {
    await requestOnce("http://site.com/", { deps: localDeps(), method: "HEAD" });
    expect(hits.length).toBeGreaterThan(0);
    expect(new Set(hits.map((h) => h.method))).toEqual(new Set(["GET", "HEAD"]));
  });
});
