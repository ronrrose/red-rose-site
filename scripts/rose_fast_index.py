#!/usr/bin/env python3
"""
Rose Standard Fast Index v1.0
Gets new and changed pages in front of search engines the day they ship, without abusing any API.

What it does
  1. Reads the live XML sitemap (sitemap indexes included) and compares it with the last run.
  2. Sends new or changed URLs to IndexNow in one request. Participating engines (Bing, Yandex,
     Naver, Seznam, Yep) share submissions.
  3. Optional: resubmits the sitemaps to Google Search Console and checks index status for the
     changed URLs with the URL Inspection API (needs a service account added to the property).
Google does not take IndexNow, retired its sitemap ping endpoint, and limits its Indexing API to
job postings and livestreams, so this tool never calls the Indexing API.

Usage
  python3 rose_fast_index.py https://www.example.com                     dry run: list what changed
  python3 rose_fast_index.py https://www.example.com --save-state        dry run and record a baseline
  python3 rose_fast_index.py https://www.example.com --key KEY --submit  send to IndexNow, save state
  ... --google-key sa.json --google-property sc-domain:example.com       add the Google steps
Setup
  1. Generate a key:  python3 -c "import secrets; print(secrets.token_hex(16))"
  2. Publish it at https://<your host>/<KEY>.txt with the key as the only content.
  3. Google steps: pip install google-auth requests, and add the service account email
     as an Owner of the Search Console property.
Python 3.9+. Standard library only, except the optional Google steps.
"""
import argparse, json, os, re, sys, time, urllib.error, urllib.parse, urllib.request
import xml.etree.ElementTree as ET

UA = "RoseFastIndex/1.0"
INDEXNOW = "https://api.indexnow.org/indexnow"


def http(url, data=None, headers=None, method=None, timeout=20):
    h = {"User-Agent": UA}
    h.update(headers or {})
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, (e.read() or b"").decode("utf-8", "ignore")
    except Exception as e:  # DNS, TLS, timeout
        return 0, f"{type(e).__name__}: {e}"


def read_sitemaps(base):
    """Return ({url: lastmod}, [sitemap urls read])."""
    status, robots = http(base + "/robots.txt")
    roots = re.findall(r"(?im)^\s*sitemap:\s*(\S+)", robots) if status == 200 else []
    queue, seen, urls = (roots or [base + "/sitemap.xml"]), [], {}
    while queue and len(seen) < 50:
        sm = queue.pop(0)
        if sm in seen:
            continue
        seen.append(sm)
        status, body = http(sm)
        if status != 200:
            print(f"  ! {sm}: HTTP {status}", file=sys.stderr)
            continue
        try:
            root = ET.fromstring(body.encode("utf-8"))
        except ET.ParseError as e:
            print(f"  ! {sm}: not valid XML ({e})", file=sys.stderr)
            continue
        if root.tag.endswith("sitemapindex"):
            queue += [el.text.strip() for el in root.iter() if el.tag.endswith("loc") and el.text]
            continue
        for node in root.iter():
            if not node.tag.endswith("}url") and node.tag != "url":
                continue
            loc = lastmod = ""
            for child in node:
                if child.tag.endswith("loc") and child.text:
                    loc = child.text.strip()
                elif child.tag.endswith("lastmod") and child.text:
                    lastmod = child.text.strip()
            if loc:
                urls[loc] = lastmod
    return urls, seen


def diff(current, previous):
    new = sorted(u for u in current if u not in previous)
    changed = sorted(u for u in current if u in previous and current[u] and current[u] != previous[u])
    removed = sorted(u for u in previous if u not in current)
    return new, changed, removed


def submit_indexnow(urls, key):
    """IndexNow needs one host per request and a key file on that host."""
    by_host, notes, ok = {}, [], True
    for u in urls:
        by_host.setdefault(urllib.parse.urlparse(u).netloc, []).append(u)
    for host, batch in by_host.items():
        key_url = f"https://{host}/{key}.txt"
        st, body = http(key_url)
        if st != 200 or body.strip() != key:
            notes.append(f"{host}: key file check failed at {key_url} (HTTP {st}); publish a file containing only the key")
            ok = False
            continue
        codes = []
        for i in range(0, len(batch), 10000):
            payload = json.dumps({"host": host, "key": key, "keyLocation": key_url,
                                  "urlList": batch[i:i + 10000]}).encode()
            st, _ = http(INDEXNOW, data=payload, method="POST",
                         headers={"Content-Type": "application/json; charset=utf-8"})
            codes.append(st)
        good = all(c in (200, 202) for c in codes)
        ok = ok and good
        notes.append(f"{host}: {len(batch)} URLs, IndexNow HTTP {codes} "
                     f"({'accepted' if good else '400 bad request, 403 bad key, 422 wrong host, 429 slow down'})")
    return ok, notes


def google_steps(key_path, prop, sitemaps, urls, limit=50):
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import AuthorizedSession
    except ImportError:
        return ["Google steps skipped: pip install google-auth requests"]
    creds = service_account.Credentials.from_service_account_file(
        key_path, scopes=["https://www.googleapis.com/auth/webmasters"])
    sess, notes = AuthorizedSession(creds), []
    site = urllib.parse.quote(prop, safe="")
    for sm in sitemaps:
        r = sess.put(f"https://www.googleapis.com/webmasters/v3/sites/{site}/sitemaps/{urllib.parse.quote(sm, safe='')}")
        notes.append(f"Search Console sitemap submit {sm}: HTTP {r.status_code}")
    for u in urls[:limit]:  # URL Inspection API quota is about 2,000 checks a day per property
        r = sess.post("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
                      json={"inspectionUrl": u, "siteUrl": prop})
        if r.status_code != 200:
            notes.append(f"{u}: inspection HTTP {r.status_code}")
            continue
        res = r.json().get("inspectionResult", {}).get("indexStatusResult", {})
        notes.append(f"{u}: {res.get('verdict', '?')} / {res.get('coverageState', '?')}")
        time.sleep(0.2)
    return notes


def main():
    ap = argparse.ArgumentParser(description="Rose Standard Fast Index")
    ap.add_argument("site")
    ap.add_argument("--key", default=os.environ.get("INDEXNOW_KEY"))
    ap.add_argument("--submit", action="store_true", help="send to IndexNow and save state")
    ap.add_argument("--all", action="store_true", help="treat every sitemap URL as changed (first launch)")
    ap.add_argument("--save-state", action="store_true", help="record the baseline even on a dry run")
    ap.add_argument("--state")
    ap.add_argument("--google-key")
    ap.add_argument("--google-property")
    ap.add_argument("--report")
    a = ap.parse_args()

    base = a.site.rstrip("/")
    base = base if base.startswith("http") else "https://" + base
    state_path = a.state or f".rose_index_state_{urllib.parse.urlparse(base).netloc}.json"
    previous = json.load(open(state_path)) if os.path.exists(state_path) else {}

    current, sitemaps = read_sitemaps(base)
    if not current:
        print("No URLs found in the sitemap. Fix the sitemap first (Gate 5).")
        sys.exit(1)
    new, changed, removed = diff(current, previous)
    send = sorted(current) if a.all else new + changed

    out = [f"# Fast Index run: {base}", "",
           f"- Sitemaps read: {len(sitemaps)}; URLs listed: {len(current)}",
           f"- Since last run: {len(new)} new, {len(changed)} changed (lastmod), {len(removed)} removed",
           f"- To submit: {len(send)}" + ("" if previous else " (no previous state: first run)")]
    out += [f"  - {u}" for u in send[:25]] + ([f"  - ...and {len(send) - 25} more"] if len(send) > 25 else [])

    save = a.save_state
    if a.submit:
        if not a.key:
            print("--submit needs --key or the INDEXNOW_KEY environment variable.")
            sys.exit(1)
        if send:
            ok, notes = submit_indexnow(send, a.key)
            out += ["", "## IndexNow"] + [f"- {n}" for n in notes]
            save = save or ok
        else:
            out += ["", "Nothing new to submit."]
            save = True
        if a.google_key and a.google_property:
            out += ["", "## Google Search Console"] + [f"- {n}" for n in
                                                      google_steps(a.google_key, a.google_property, sitemaps, send)]
    else:
        out += ["", "Dry run: nothing sent. Add --key KEY --submit to send."]

    if save:
        os.makedirs(os.path.dirname(os.path.abspath(state_path)), exist_ok=True)
        json.dump(current, open(state_path, "w"), indent=0)
        out.append(f"\nState saved to {state_path}.")
    report = "\n".join(out)
    print(report)
    if a.report:
        os.makedirs(os.path.dirname(os.path.abspath(a.report)), exist_ok=True)
        open(a.report, "w").write(report + "\n")


if __name__ == "__main__":
    main()
