import { isIP } from "node:net";

/**
 * Is this address somewhere the scanner must never connect to?
 *
 * The second SSRF fence: every address a hostname resolves to, at every
 * redirect hop, goes through here before a socket opens. Anything that is not
 * plainly public internet is refused: loopback, RFC 1918, link-local (which
 * includes cloud metadata at 169.254.169.254), CGNAT, multicast, documentation
 * and benchmark ranges, "this network", broadcast, and every IPv6 equivalent.
 * Addresses that tunnel IPv4 inside IPv6 are unwrapped and judged as IPv4.
 *
 * IPv6 is allow-listed rather than deny-listed: only global unicast
 * (2000::/3) is considered at all, then the special ranges inside it are
 * removed. A new IANA assignment outside 2000::/3 is refused by default.
 */

type V4Range = [number, number]; // [network, prefix length]

const V4_BLOCKED: V4Range[] = [
  [v4("0.0.0.0"), 8], // "this network"
  [v4("10.0.0.0"), 8], // private
  [v4("100.64.0.0"), 10], // carrier-grade NAT
  [v4("127.0.0.0"), 8], // loopback
  [v4("169.254.0.0"), 16], // link-local, cloud metadata
  [v4("172.16.0.0"), 12], // private
  [v4("192.0.0.0"), 24], // IETF protocol assignments
  [v4("192.0.2.0"), 24], // documentation
  [v4("192.31.196.0"), 24], // AS112
  [v4("192.52.193.0"), 24], // AMT
  [v4("192.88.99.0"), 24], // 6to4 relay anycast
  [v4("192.168.0.0"), 16], // private
  [v4("192.175.48.0"), 24], // AS112
  [v4("198.18.0.0"), 15], // benchmarking
  [v4("198.51.100.0"), 24], // documentation
  [v4("203.0.113.0"), 24], // documentation
  [v4("224.0.0.0"), 4], // multicast
  [v4("240.0.0.0"), 4], // reserved, includes 255.255.255.255
];

function v4(s: string): number {
  const p = s.split(".").map(Number);
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}

function inV4(addr: number, [net, bits]: V4Range): boolean {
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~0 << (32 - bits)) >>> 0;
  return ((addr & mask) >>> 0) === ((net & mask) >>> 0);
}

export function isBlockedIPv4(address: string): boolean {
  if (isIP(address) !== 4) return true;
  const n = v4(address);
  return V4_BLOCKED.some((r) => inV4(n, r));
}

/** Expand an IPv6 address to eight 16-bit groups. Null if it will not parse. */
export function expandIPv6(address: string): number[] | null {
  if (isIP(address) !== 6) return null;
  let s = address.toLowerCase();
  if (s.includes("%")) return null; // zone ids are link-local by definition

  // Dotted IPv4 tail, as in ::ffff:192.0.2.1
  const tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(s);
  if (tail) {
    const n = v4(tail[1]);
    s = s.slice(0, -tail[1].length) + ((n >>> 16).toString(16) + ":" + (n & 0xffff).toString(16));
  }

  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - rest.length : 0;
  if (fill < 0) return null;
  const groups = [...head, ...Array(fill).fill("0"), ...rest].map((g) => parseInt(g, 16));
  if (groups.length !== 8 || groups.some((g) => Number.isNaN(g) || g < 0 || g > 0xffff)) return null;
  return groups;
}

function embeddedV4(g: number[], hiIndex: number): string {
  const hi = g[hiIndex];
  const lo = g[hiIndex + 1];
  return `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`;
}

export function isBlockedIPv6(address: string): boolean {
  const g = expandIPv6(address);
  if (!g) return true;

  // IPv4-mapped ::ffff:a.b.c.d and the deprecated IPv4-compatible ::a.b.c.d
  if (g.slice(0, 5).every((x) => x === 0) && (g[5] === 0xffff || g[5] === 0)) {
    if (g[5] === 0 && g[6] === 0 && (g[7] === 0 || g[7] === 1)) return true; // :: and ::1
    return isBlockedIPv4(embeddedV4(g, 6));
  }
  // NAT64 well-known prefix 64:ff9b::/96 and local-use 64:ff9b:1::/48
  if (g[0] === 0x64 && g[1] === 0xff9b) {
    if (g[2] === 1) return true;
    if (g.slice(2, 6).every((x) => x === 0)) return isBlockedIPv4(embeddedV4(g, 6));
    return true;
  }

  // Only global unicast is ever considered.
  if ((g[0] & 0xe000) !== 0x2000) return true;

  // 2001::/23 IETF protocol assignments (includes Teredo 2001::/32, ORCHID)
  if (g[0] === 0x2001 && g[1] < 0x0200) return true;
  // 2001:db8::/32 documentation
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true;
  // 2002::/16 6to4: judge the embedded IPv4
  if (g[0] === 0x2002) return isBlockedIPv4(embeddedV4(g, 1));
  // 3fff::/20 documentation (RFC 9637)
  if (g[0] >= 0x3fff && g[0] <= 0x3fff && g[1] < 0x1000) return true;

  return false;
}

export function isBlockedAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return isBlockedIPv4(address);
  if (family === 6) return isBlockedIPv6(address);
  return true;
}
