#!/usr/bin/env python3
"""
Rose Standard Gate Scanner v1.0
Automates the machine-checkable parts of the Rose Standard launch gates:
  Gate 1 (Accessibility, surface checks), Gate 2 (Legal links, email auth),
  Gate 3 (Privacy and Security headers, tracker inventory), Gate 5 (SEO, AEO, GEO).
It never replaces the manual protocol in the Bible. Read-only: it only sends GET requests.

Usage:
  python3 rose_gate_scan.py ciycapital.com redrosetechnologies.com
  python3 rose_gate_scan.py https://example.com --json report.json --md report.md
Exit code 1 if any FAIL (drop it into CI against a preview URL).
Requires Python 3.9+, standard library only.
"""
import argparse, json, re, ssl, sys, time, urllib.parse, urllib.request
from html.parser import HTMLParser

TIMEOUT = 15
BROWSER_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
AI_UAS = {
    "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    "ClaudeBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "PerplexityBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
}
ROBOTS_BOTS = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "GPTBot", "Claude-SearchBot",
               "Claude-User", "ClaudeBot", "PerplexityBot", "Perplexity-User", "Applebot", "Google-Extended"]
SEARCH_BOTS = {"Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User",
               "PerplexityBot", "Perplexity-User", "Applebot"}
TRACKERS = {
    "googletagmanager.com": "Google Tag Manager", "google-analytics.com": "Google Analytics",
    "connect.facebook.net": "Meta Pixel", "clarity.ms": "Microsoft Clarity (session replay)",
    "hotjar.com": "Hotjar (session replay)", "analytics.tiktok.com": "TikTok Pixel",
    "snap.licdn.com": "LinkedIn Insight", "doubleclick.net": "Google Ads", "fullstory.com": "FullStory (session replay)",
}
DKIM_SELECTORS = ["google", "selector1", "selector2", "k1", "s1", "s2", "default", "resend", "mail"]


def fetch(url, ua=BROWSER_UA, method="GET", limit=3_000_000):
    """Return dict(status, url, headers, body, ms, error)."""
    req = urllib.request.Request(url, method=method, headers={"User-Agent": ua, "Accept": "*/*"})
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ssl.create_default_context()) as r:
            body = r.read(limit).decode("utf-8", "ignore")
            return {"status": r.status, "url": r.geturl(), "headers": {k.lower(): v for k, v in r.headers.items()},
                    "body": body, "ms": int((time.time() - start) * 1000), "error": None}
    except urllib.error.HTTPError as e:
        body = e.read(200_000).decode("utf-8", "ignore") if e.fp else ""
        return {"status": e.code, "url": url, "headers": {k.lower(): v for k, v in (e.headers or {}).items()},
                "body": body, "ms": int((time.time() - start) * 1000), "error": f"HTTP {e.code}"}
    except Exception as e:  # DNS, TLS, timeout
        return {"status": 0, "url": url, "headers": {}, "body": "", "ms": int((time.time() - start) * 1000),
                "error": f"{type(e).__name__}: {e}"}


def doh(name, rtype="TXT"):
    """DNS over HTTPS via Google; returns list of answer strings."""
    r = fetch(f"https://dns.google/resolve?name={urllib.parse.quote(name)}&type={rtype}")
    try:
        return [a.get("data", "").strip('"').replace('" "', "") for a in json.loads(r["body"]).get("Answer", [])]
    except Exception:
        return []


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.in_title, self.skip = "", False, 0
        self.text, self.meta, self.links, self.scripts = [], {}, [], []
        self.h1, self.imgs, self.imgs_no_alt, self.lang, self.canonical = 0, 0, 0, None, None
        self.jsonld, self.in_jsonld, self.anchors, self.empty_anchors = [], False, [], 0
        self._a_stack = []

    def handle_starttag(self, tag, attrs):
        a = {k.lower(): (v or "") for k, v in attrs}
        if tag == "html":
            self.lang = a.get("lang") or a.get("xml:lang")
        elif tag == "title":
            self.in_title = True
        elif tag in ("script", "style", "noscript", "svg", "template"):
            self.skip += 1
            if tag == "script":
                if a.get("src"):
                    self.scripts.append(a["src"])
                if "ld+json" in a.get("type", ""):
                    self.in_jsonld = True
        elif tag == "meta":
            key = (a.get("name") or a.get("property") or "").lower()
            if key:
                self.meta[key] = a.get("content", "")
        elif tag == "link" and "canonical" in a.get("rel", "").lower():
            self.canonical = a.get("href")
        elif tag == "h1":
            self.h1 += 1
        elif tag == "img":
            self.imgs += 1
            if "alt" not in a:
                self.imgs_no_alt += 1
        elif tag == "a":
            self._a_stack.append({"href": a.get("href", ""), "label": a.get("aria-label", ""), "text": ""})

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag in ("script", "style", "noscript", "svg", "template"):
            self.skip = max(0, self.skip - 1)
            self.in_jsonld = False
        elif tag == "a" and self._a_stack:
            link = self._a_stack.pop()
            if not (link["text"].strip() or link["label"].strip()):
                self.empty_anchors += 1
            self.anchors.append(link)

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_jsonld:
            self.jsonld.append(data)
        if self.skip == 0:
            self.text.append(data)
            for link in self._a_stack:
                link["text"] += data


def jsonld_types(chunks):
    types = set()
    def walk(node):
        if isinstance(node, dict):
            t = node.get("@type")
            if isinstance(t, list):
                types.update(map(str, t))
            elif t:
                types.add(str(t))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    for c in chunks:
        try:
            walk(json.loads(c))
        except Exception:
            pass
    return sorted(types)


def robots_blocked(robots_txt, bot):
    """Approximate: is '/' disallowed for this bot? Most specific matching group wins, else '*'."""
    groups, current, seen_rule = [], None, False
    for raw in robots_txt.splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        field, value = [x.strip() for x in line.split(":", 1)]
        field = field.lower()
        if field == "user-agent":
            if current is None or seen_rule:
                current = {"agents": [], "rules": []}
                groups.append(current)
                seen_rule = False
            current["agents"].append(value.lower())
        elif field in ("allow", "disallow") and current is not None:
            current["rules"].append((field, value))
            seen_rule = True
    match = [g for g in groups if any(ag != "*" and ag in bot.lower() for ag in g["agents"])]
    if not match:
        match = [g for g in groups if "*" in g["agents"]]
    rules = [r for g in match for r in g["rules"]]
    disallow_root = any(f == "disallow" and v in ("/", "/*") for f, v in rules)
    allow_root = any(f == "allow" and v in ("/", "/*") for f, v in rules)
    return disallow_root and not allow_root


def scan(target):
    host = re.sub(r"^https?://", "", target).split("/")[0]
    base = f"https://{host}"
    res = {"site": host, "checks": [], "inventory": {}}

    def add(gate, check, status, detail):
        res["checks"].append({"gate": gate, "check": check, "status": status, "detail": detail})

    home = fetch(base + "/")
    if home["status"] == 0 or home["status"] >= 500:
        add("Search", "Homepage reachable", "FAIL", home["error"] or f"HTTP {home['status']}")
        return res
    add("Search", "Homepage reachable", "PASS" if home["status"] == 200 else "WARN",
        f"HTTP {home['status']} in {home['ms']} ms, {len(home['body']) // 1024} KB HTML")
    h = home["headers"]

    # Gate 3: transport and headers
    plain = fetch(f"http://{host}/")
    add("Security", "HTTP redirects to HTTPS", "PASS" if plain["url"].startswith("https://") else "FAIL",
        plain["url"] or plain["error"])
    hsts = h.get("strict-transport-security", "")
    m = re.search(r"max-age=(\d+)", hsts)
    add("Security", "HSTS", "PASS" if m and int(m.group(1)) >= 15552000 else ("WARN" if hsts else "FAIL"),
        hsts or "missing")
    csp = h.get("content-security-policy", "")
    add("Security", "Content-Security-Policy", "PASS" if csp else "WARN", (csp[:90] + "...") if len(csp) > 90 else (csp or "missing"))
    add("Security", "X-Content-Type-Options", "PASS" if h.get("x-content-type-options", "").lower() == "nosniff" else "WARN",
        h.get("x-content-type-options", "missing"))
    add("Security", "Referrer-Policy", "PASS" if h.get("referrer-policy") else "WARN", h.get("referrer-policy", "missing"))
    add("Security", "Permissions-Policy", "PASS" if h.get("permissions-policy") else "WARN",
        (h.get("permissions-policy", "missing"))[:90])
    framed = h.get("x-frame-options") or ("frame-ancestors" in csp)
    add("Security", "Clickjacking protection", "PASS" if framed else "WARN",
        h.get("x-frame-options") or ("CSP frame-ancestors" if framed else "missing"))
    if h.get("server") or h.get("x-powered-by"):
        add("Security", "Stack disclosure", "INFO", f"server={h.get('server', '')} x-powered-by={h.get('x-powered-by', '')}")

    # Parse homepage
    p = PageParser()
    p.feed(home["body"])
    words = len(re.findall(r"[A-Za-z0-9']{2,}", " ".join(p.text)))

    # Gate 5: SEO basics
    t = " ".join(p.title.split())
    add("Search", "Title", "PASS" if 10 <= len(t) <= 65 else "WARN", f"{len(t)} chars: {t[:80]}")
    d = p.meta.get("description", "")
    add("Search", "Meta description", "PASS" if 70 <= len(d) <= 165 else "WARN", f"{len(d)} chars")
    add("Search", "Canonical", "PASS" if p.canonical else "WARN", p.canonical or "missing")
    add("Search", "One H1", "PASS" if p.h1 == 1 else "WARN", f"{p.h1} H1 tags")
    og = [k for k in ("og:title", "og:description", "og:image") if p.meta.get(k)]
    add("Search", "Open Graph", "PASS" if len(og) == 3 else "WARN", f"{len(og)}/3 present")
    robots_meta = p.meta.get("robots", "") + " " + h.get("x-robots-tag", "")
    add("Search", "Not noindexed", "FAIL" if "noindex" in robots_meta.lower() else "PASS", robots_meta.strip() or "indexable")
    types = jsonld_types(p.jsonld)
    add("Search", "Structured data (JSON-LD)", "PASS" if types else "WARN", ", ".join(types) or "none found")

    # Gate 5: GEO, the AI-crawler view
    shell = bool(re.search(r'<div id="(root|app|__next)"\s*>\s*</div>', home["body"]))
    status = "PASS" if words >= 250 else ("WARN" if words >= 100 else "FAIL")
    add("GEO", "Raw HTML copy (what AI crawlers read)", status,
        f"{words} words without JavaScript" + (" | empty app shell detected" if shell else ""))
    robots = fetch(base + "/robots.txt")
    rtxt = robots["body"] if robots["status"] == 200 else ""
    add("Search", "robots.txt", "PASS" if rtxt else "WARN", "present" if rtxt else f"HTTP {robots['status']}")
    blocked = [b for b in ROBOTS_BOTS if rtxt and robots_blocked(rtxt, b)]
    bad = [b for b in blocked if b in SEARCH_BOTS]
    add("GEO", "AI search bots allowed in robots.txt", "FAIL" if bad else "PASS",
        ("blocked: " + ", ".join(bad)) if bad else "no search or user-fetch bot blocked")
    training = [b for b in blocked if b not in SEARCH_BOTS]
    if training:
        add("GEO", "Training bots", "INFO", "blocked by choice: " + ", ".join(training))
    browser_status = home["status"]
    walls = []
    for name, ua in AI_UAS.items():
        r = fetch(base + "/", ua=ua, limit=200_000)
        challenged = r["status"] in (401, 403, 429, 503) or "cf-mitigated" in r["headers"] or "Just a moment" in r["body"][:5000]
        if challenged and browser_status == 200:
            walls.append(f"{name}={r['status'] or r['error']}")
    add("GEO", "CDN or firewall lets AI bots in", "FAIL" if walls else "PASS",
        ("refused: " + ", ".join(walls) + " (spoofed user agents; confirm in CDN logs)") if walls else "same response as a browser")
    sm_urls = re.findall(r"(?im)^sitemap:\s*(\S+)", rtxt) or [base + "/sitemap.xml"]
    sm = fetch(sm_urls[0])
    locs = len(re.findall(r"<loc>", sm["body"])) if sm["status"] == 200 else 0
    add("Search", "XML sitemap", "PASS" if locs else "WARN", f"{locs} URLs at {sm_urls[0]}" if locs else f"not found ({sm['status']})")
    llms = fetch(base + "/llms.txt", limit=50_000)
    is_txt = llms["status"] == 200 and "<html" not in llms["body"][:300].lower()
    add("GEO", "llms.txt (optional)", "INFO", "present" if is_txt else "absent (optional, not a ranking factor)")
    sec = fetch(base + "/.well-known/security.txt", limit=20_000)
    add("Security", "security.txt (RFC 9116)", "INFO", "present" if sec["status"] == 200 and "contact:" in sec["body"].lower() else "absent")

    # Gate 1: accessibility surface checks
    add("Accessibility", "Page language declared", "PASS" if p.lang else "FAIL", p.lang or "missing lang attribute")
    vp = p.meta.get("viewport", "")
    zoom_blocked = "user-scalable=no" in vp.replace(" ", "") or re.search(r"maximum-scale=1(\.0)?\b", vp.replace(" ", ""))
    add("Accessibility", "Zoom allowed", "FAIL" if zoom_blocked else ("PASS" if vp else "WARN"), vp or "no viewport meta")
    add("Accessibility", "Images have alt attribute", "PASS" if p.imgs_no_alt == 0 else "FAIL",
        f"{p.imgs_no_alt} of {p.imgs} images missing alt")
    add("Accessibility", "Links have accessible names", "PASS" if p.empty_anchors == 0 else "WARN",
        f"{p.empty_anchors} links with no text or aria-label")
    skip = any(a["href"].startswith("#") and ("skip" in (a["text"] + a["label"]).lower() or "main" in a["href"].lower()) for a in p.anchors)
    add("Accessibility", "Skip link", "PASS" if skip else "WARN", "found" if skip else "none found")
    overlay = re.search(r"accessibe|acsbapp|userway|audioeye|equalweb|max-access", home["body"], re.I)
    add("Accessibility", "No accessibility overlay", "FAIL" if overlay else "PASS", overlay.group(0) if overlay else "none detected")

    # Gate 2: legal links
    hay = " ".join((a["href"] + " " + a["text"]).lower() for a in p.anchors)
    for label, keys in (("Privacy Policy link", ("privacy",)), ("Terms link", ("terms",)),
                        ("Accessibility Statement link", ("accessibility",))):
        found = any(k in hay for k in keys)
        add("Legal", label, "PASS" if found else ("FAIL" if label != "Accessibility Statement link" else "WARN"),
            "linked from homepage" if found else "not linked from homepage")

    # Gate 3: tracker inventory (must match the privacy policy)
    hosts = sorted({urllib.parse.urlparse(urllib.parse.urljoin(base, s)).netloc for s in p.scripts} - {host, "www." + host})
    found_trackers = sorted({name for dom, name in TRACKERS.items() if dom in home["body"]})
    res["inventory"] = {"third_party_script_hosts": hosts, "trackers": found_trackers}
    add("Privacy", "Tag inventory", "INFO", (", ".join(found_trackers) or "no known ad or replay trackers") +
        f" | {len(hosts)} third-party script hosts")
    mixed = len(re.findall(r'(?:src|href)="http://', home["body"]))
    add("Security", "No mixed content", "PASS" if mixed == 0 else "WARN", f"{mixed} http:// references")

    # Foundation: email authentication
    apex = host[4:] if host.startswith("www.") else host
    spf = [x for x in doh(apex) if x.lower().startswith("v=spf1")]
    add("Email", "SPF record", "PASS" if len(spf) == 1 else ("FAIL" if not spf else "WARN"),
        spf[0][:90] if len(spf) == 1 else (f"{len(spf)} SPF records (must be exactly 1)" if spf else "missing"))
    dmarc = [x for x in doh("_dmarc." + apex) if x.lower().startswith("v=dmarc1")]
    pol = re.search(r"p=(\w+)", dmarc[0]).group(1).lower() if dmarc and re.search(r"p=(\w+)", dmarc[0]) else None
    add("Email", "DMARC policy", "PASS" if pol in ("quarantine", "reject") else ("WARN" if pol == "none" else "FAIL"),
        f"p={pol}" if pol else "missing")
    dkim = [s for s in DKIM_SELECTORS if any("p=" in x for x in doh(f"{s}._domainkey.{apex}"))]
    add("Email", "DKIM (common selectors)", "PASS" if dkim else "INFO",
        ("found: " + ", ".join(dkim)) if dkim else "none at common selectors; confirm in the sending platform")
    return res


def to_markdown(results):
    out = ["# Rose Standard gate scan", ""]
    for r in results:
        counts = {s: sum(c["status"] == s for c in r["checks"]) for s in ("PASS", "WARN", "FAIL", "INFO")}
        out += [f"## {r['site']}  (PASS {counts['PASS']} / WARN {counts['WARN']} / FAIL {counts['FAIL']})", "",
                "| Gate | Check | Status | Detail |", "| --- | --- | --- | --- |"]
        out += [f"| {c['gate']} | {c['check']} | {c['status']} | {c['detail'].replace('|', '/')} |" for c in r["checks"]]
        out.append("")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Rose Standard gate scanner (read-only)")
    ap.add_argument("sites", nargs="+")
    ap.add_argument("--json")
    ap.add_argument("--md")
    a = ap.parse_args()
    results = [scan(s) for s in a.sites]
    md = to_markdown(results)
    print(md)
    if a.json:
        open(a.json, "w").write(json.dumps(results, indent=2))
    if a.md:
        open(a.md, "w").write(md)
    sys.exit(1 if any(c["status"] == "FAIL" for r in results for c in r["checks"]) else 0)


if __name__ == "__main__":
    main()
