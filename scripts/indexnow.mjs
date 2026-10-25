#!/usr/bin/env node
/**
 * Push every published URL to IndexNow after a deploy.
 *
 * IndexNow is how you tell Bing about a change now: Bing retired the old
 * https://www.bing.com/ping?sitemap=... endpoint and it answers 410 Gone
 * (verified 2026-10-25). One POST to api.indexnow.org reaches Bing, Yandex,
 * Seznam and Naver together. Google does not participate in IndexNow and is
 * notified by crawling the sitemap instead.
 *
 * The URL list is read from the live sitemap rather than hard-coded, so this
 * submits exactly what is published and cannot drift from app/sitemap.ts.
 *
 *   node scripts/indexnow.mjs                 # submit the live sitemap
 *   node scripts/indexnow.mjs --dry-run       # print what would be sent
 *   node scripts/indexnow.mjs --host example.com --key abc
 *
 * Exits non-zero when the endpoint rejects the batch, so CI fails loudly
 * rather than silently skipping indexing.
 */

const ENDPOINT = "https://api.indexnow.org/indexnow";
const DEFAULT_HOST = "www.redrosetechnologies.com";
const DEFAULT_KEY = "0d855a4472bb486aabe5c6488d6c4937";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const host = arg("host", process.env.INDEXNOW_HOST || DEFAULT_HOST);
const key = arg("key", process.env.INDEXNOW_KEY || DEFAULT_KEY);
const dryRun = process.argv.includes("--dry-run");
const origin = `https://${host}`;
const keyLocation = `${origin}/${key}.txt`;

async function sitemapUrls() {
  const res = await fetch(`${origin}/sitemap.xml`, {
    headers: { "user-agent": "red-rose-indexnow/1.0" },
  });
  if (!res.ok) {
    throw new Error(`sitemap.xml returned ${res.status}`);
  }
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (urls.length === 0) {
    throw new Error("sitemap.xml contained no <loc> entries");
  }
  // IndexNow rejects a batch containing a URL from another host.
  const foreign = urls.filter((u) => new URL(u).host !== host);
  if (foreign.length > 0) {
    throw new Error(
      `sitemap lists ${foreign.length} URL(s) on another host, e.g. ${foreign[0]}`
    );
  }
  return urls;
}

async function checkKeyFile() {
  // The key file has to be fetchable or IndexNow cannot verify ownership.
  const keyRes = await fetch(keyLocation);
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
  const ok = keyRes.ok && keyBody === key;
  if (!ok && !dryRun) {
    throw new Error(
      `key file ${keyLocation} is not serving the key (status ${keyRes.status})`
    );
  }
  // A dry run submits nothing, so it stays useful before the key is deployed.
  if (!ok) {
    console.warn(
      `  warning: ${keyLocation} is not serving the key yet (status ${keyRes.status})`
    );
  }
}

async function main() {
  await checkKeyFile();

  const urlList = await sitemapUrls();
  console.log(`IndexNow: ${urlList.length} URL(s) from ${origin}/sitemap.xml`);

  if (dryRun) {
    for (const u of urlList) console.log(`  ${u}`);
    console.log("--dry-run: nothing submitted");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  // 200 accepted, 202 accepted but key still validating. Anything else is a
  // real failure worth breaking the run over.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow returned ${res.status}: ${await res.text()}`);
  }
  console.log(`IndexNow accepted ${urlList.length} URL(s) (HTTP ${res.status})`);
}

main().catch((err) => {
  console.error(`IndexNow submission failed: ${err.message}`);
  process.exit(1);
});
