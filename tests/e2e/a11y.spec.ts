import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fixture from "./fixtures/scan-result.json";

/**
 * Rose Standard Gate 1: zero serious or critical axe violations, and no
 * sideways scroll, on every key template at 1440 and 390. The kit's list
 * included /accessibility, which this site does not have yet.
 *
 * The scan and report APIs are intercepted with a fixed result, so the
 * results, lead form and quiz states are tested without touching the network.
 */

const PAGES = ["/", "/about", "/contact", "/privacy", "/dental", "/free-security-check", "/security-reviews"];

/**
 * Below-the-fold sections fade in on scroll (components/Reveal.tsx) and sit
 * at opacity 0 until then, which axe would score as unreadable text. The
 * site already shows the final state under reduced motion, so the scan runs
 * that way and measures what a reader actually sees.
 */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function axe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.length} nodes`);
}

async function sideways(page: Page): Promise<number> {
  return page.evaluate(() => {
    window.scrollTo({ left: 500, behavior: "instant" as ScrollBehavior });
    const x = window.scrollX;
    window.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    return x;
  });
}

for (const path of PAGES) {
  test(`axe and no sideways scroll: ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await axe(page)).toEqual([]);
    expect(await sideways(page)).toBe(0);
  });
}

test("free security check: results, lead form and quiz pass axe", async ({ page }) => {
  await page.route("**/api/security-check/scan", (r) =>
    r.fulfill({ contentType: "application/json", body: JSON.stringify({ scanId: "test", result: fixture, signature: null, cached: false, followups: false }) })
  );
  await page.goto("/free-security-check");

  // The checkbox is required.
  await page.getByLabel("Your practice's website").fill("weak-practice.com");
  await page.getByRole("button", { name: "Run the free check" }).click();
  await expect(page.getByText("Tick the box to confirm you own or manage this domain and authorize the check.", { exact: true })).toBeVisible();

  await page.getByLabel(/I own or manage this domain/).check();
  await page.getByRole("button", { name: "Run the free check" }).click();
  await expect(page.getByRole("heading", { name: "What to fix first" })).toBeVisible();
  await expect(page.getByText("This free check covers public signals only. It is not a full security assessment or a HIPAA compliance determination.", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Reviewed by Red Rose Technologies, verified in Anthropic's Cyber Verification Program (Defense Access)", { exact: true })).toBeVisible();
  // No price is published anywhere in the result.
  expect(await page.locator("main").innerText()).not.toMatch(/\$\s?\d/);
  await expect(page.getByRole("link", { name: /Book a free 30-minute review of your results/ }).first()).toHaveAttribute("href", "https://ro.am/ronrose/meeting");

  // One review offer inside the results, one standing block at the bottom with its own wording.
  await expect(page.getByText("Go through the results with us. We will tell you what to fix first and what can wait.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Book a review" }).getByRole("heading", { name: "Want a second set of eyes?" })).toBeVisible();

  // Quiz: every question answered with its first option.
  const groups = page.locator("#shadow-ai fieldset");
  const n = await groups.count();
  for (let i = 0; i < n; i++) await groups.nth(i).locator("label").first().click();
  await page.getByRole("button", { name: "See my risk level" }).click();
  await expect(page.getByText(/^(Low|Medium|High) risk$/)).toBeVisible();

  // Lead form validation is inline.
  await page.getByRole("button", { name: "Email me the full report" }).click();
  await expect(page.getByText("Enter your name.", { exact: true })).toBeVisible();

  expect(await axe(page)).toEqual([]);
  expect(await sideways(page)).toBe(0);
});

test("free security check: closed state is a calm call-us panel, not an error", async ({ page }) => {
  await page.route("**/api/security-check/scan", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ unavailable: true, error: "The free check is temporarily unavailable. Call us at (941) 206-4709 and we will run it with you." }),
    })
  );
  await page.goto("/free-security-check");
  await page.getByLabel("Your practice's website").fill("smiledental.com");
  await page.getByLabel(/I own or manage this domain/).check();
  await page.getByRole("button", { name: "Run the free check" }).click();
  await expect(page.getByText("The free check is temporarily unavailable.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Call (941) 206-4709" })).toHaveAttribute("href", "tel:+19412064709");
  expect(await axe(page)).toEqual([]);
});

test("security reviews: static hero, booking link, six FAQs and matching FAQPage schema", async ({ page }) => {
  await page.goto("/security-reviews");
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveText("AI-assisted security reviews for healthcare and nonprofits");
  // Nothing above the fold starts invisible.
  expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  const book = page.getByRole("link", { name: /Book a security review/ });
  await expect(book).toHaveCount(2);
  await expect(book.first()).toHaveAttribute("href", "https://ro.am/ronrose/meeting");
  await expect(page.locator("main details")).toHaveCount(6);
  expect(await page.locator("main").innerText()).not.toMatch(/\$\s?\d|starting at/i);

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes = blocks.flatMap((b) => {
    const j = JSON.parse(b);
    return j["@graph"] ?? [j];
  });
  const types = nodes.map((n) => n["@type"]);
  for (const t of ["ProfessionalService", "Service", "FAQPage", "BreadcrumbList"]) expect(types).toContain(t);
  const faq = nodes.find((n) => n["@type"] === "FAQPage");
  const visible = await page.locator("main details").evaluateAll((ds) =>
    ds.map((d) => ({ q: d.querySelector("summary")!.textContent!.trim(), a: d.querySelector("p")!.textContent!.trim() }))
  );
  expect(faq.mainEntity.map((e: { name: string; acceptedAnswer: { text: string } }) => ({ q: e.name, a: e.acceptedAnswer.text }))).toEqual(visible);
});

test("trust strip: three text items, no images, in the footer and below the homepage hero", async ({ page }) => {
  await page.goto("/");
  const items = ["Microsoft Partner (6963034)", "Verified in Anthropic's Cyber Verification Program (Defense Access)", "HIPAA-focused MSP for healthcare and nonprofits"];
  for (const strip of [page.locator("main section[aria-label=Credentials]").first(), page.locator("footer ul[aria-label=Credentials]")]) {
    await expect(strip.locator("li")).toHaveText(items);
    await expect(strip.locator("img, svg")).toHaveCount(0);
  }
  // Right below the hero: the strip is the second section in main.
  await expect(page.locator("main > section").nth(1)).toHaveAttribute("aria-label", "Credentials");
});

for (const width of [1024, 1280, 1440]) {
  test(`nav labels stay on one line at ${width}`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop-1440", "sets its own viewport; once is enough");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    // The first lg:flex group holds the page links; the second is the phone and CTA.
    const links = page.locator('nav[aria-label="Main navigation"] .lg\\:flex').first().locator("a");
    await expect(links).toHaveCount(8);
    const heights = await links.evaluateAll((as) => as.map((a) => (a as HTMLElement).getBoundingClientRect().height));
    for (const h of heights) expect(h).toBeLessThan(24);
    // The links end before the phone/CTA group starts, so nothing overlaps.
    const lastRight = await links.last().evaluate((a) => a.getBoundingClientRect().right);
    const ctaLeft = await page.locator('nav[aria-label="Main navigation"] .lg\\:flex').nth(1).evaluate((d) => d.getBoundingClientRect().left);
    expect(lastRight).toBeLessThanOrEqual(ctaLeft);
    // Same sideways check as the axe tests: scrollWidth alone misreads the homepage marquee.
    // On failure, name what sticks out: unclipped, non-fixed elements past the right edge.
    const scrolled = await sideways(page);
    const offenders = scrolled === 0 ? [] : await page.evaluate(() => {
      const W = document.documentElement.clientWidth;
      const clippedOrFixed = (e: Element) => {
        for (let p: Element | null = e; p && p !== document.body; p = p.parentElement) {
          const cs = getComputedStyle(p);
          if (cs.position === "fixed") return true;
          if (p !== e && ["hidden", "clip", "auto", "scroll"].includes(cs.overflowX)) return true;
        }
        return false;
      };
      return [...document.querySelectorAll("body *")]
        .filter((e) => e.getBoundingClientRect().right > W + 0.5 && !clippedOrFixed(e))
        .map((e) => `${e.tagName}.${String((e as HTMLElement).className).slice(0, 60)} right=${Math.round(e.getBoundingClientRect().right)} "${((e as HTMLElement).innerText || "").slice(0, 30)}"`)
        .slice(0, 8);
    });
    expect({ scrolled, offenders }).toEqual({ scrolled: 0, offenders: [] });
  });
}
