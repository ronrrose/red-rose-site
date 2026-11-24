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

const PAGES = ["/", "/about", "/contact", "/privacy", "/dental", "/free-security-check"];

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
  await expect(page.getByText("Tick the box to confirm")).toBeVisible();

  await page.getByLabel(/I own or manage this domain/).check();
  await page.getByRole("button", { name: "Run the free check" }).click();
  await expect(page.getByText("What to fix first")).toBeVisible();
  await expect(page.getByText("This free check covers public signals only. It is not a full security assessment or a HIPAA compliance determination.").first()).toBeVisible();
  await expect(page.getByText("Reviewed by Red Rose Technologies, verified in Anthropic's Cyber Verification Program (Defense Access)")).toBeVisible();
  await expect(page.getByText("Run the full check from an email address at this domain.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Book a free 30-minute review of your results/ }).first()).toHaveAttribute("href", "https://ro.am/ronrose/meeting");

  // Quiz: every question answered with its first option.
  const groups = page.locator("#shadow-ai fieldset");
  const n = await groups.count();
  for (let i = 0; i < n; i++) await groups.nth(i).locator("label").first().click();
  await page.getByRole("button", { name: "See my risk level" }).click();
  await expect(page.getByText(/(Low|Medium|High) risk/)).toBeVisible();

  // Lead form validation is inline.
  await page.getByRole("button", { name: "Email me the full report" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();

  expect(await axe(page)).toEqual([]);
  expect(await sideways(page)).toBe(0);
});
