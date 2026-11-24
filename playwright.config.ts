import { defineConfig, devices } from "@playwright/test";

/**
 * Rose Standard Gate 1 (from the Rose Standard starter kit), adapted:
 * end-to-end specs live in tests/e2e so they never mix with the vitest unit
 * tests in tests/. Set BASE_URL to test a preview deployment instead of a
 * local build.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  // channel "chromium" runs the full Chromium build in headless mode, so the
  // separate headless-shell download is not needed.
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000", channel: "chromium" },
  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: false } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: "npm run build && npm start", url: "http://localhost:3000", timeout: 300_000, reuseExistingServer: true },
});
