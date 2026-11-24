import wpCore from "@/lib/security-check/data/wordpress-core-status.json";

/**
 * The "known outdated" list, every entry from a named public source with the
 * date it was read. Nothing here is a judgment call of ours.
 *
 * Refresh by re-reading the sources below and updating the date. A stale list
 * errs safe: a version released after the snapshot is reported as "version
 * visible, not on our list", never as outdated.
 */

export type CoreStatus = "latest" | "outdated" | "insecure" | "unknown";

/**
 * WordPress core. WordPress.org's own feed labels every release "latest",
 * "outdated" (still a supported branch, just not newest) or "insecure".
 */
export const WORDPRESS_CORE = {
  source: wpCore.source,
  retrieved: wpCore.retrieved,
  latest: Object.entries(wpCore.versions as Record<string, string>).find(([, s]) => s === "latest")?.[0] ?? null,
};

export function wordpressCoreStatus(version: string): CoreStatus {
  const status = (wpCore.versions as Record<string, string>)[version];
  if (status === "latest" || status === "outdated" || status === "insecure") return status;
  return "unknown";
}

/**
 * Current release of common plugins, from the WordPress.org plugin directory
 * API (api.wordpress.org/plugins/info/1.2/), read on the date below. Older
 * than this is reported as "older than the current release", which is true,
 * and not as "vulnerable", which we cannot know from a version number alone.
 */
export const PLUGIN_SNAPSHOT_DATE = "2026-11-24";
export const PLUGIN_SOURCE = "https://api.wordpress.org/plugins/info/1.2/";
export const PLUGIN_LATEST: Record<string, string> = {
  elementor: "4.4.1",
  "contact-form-7": "6.2.6",
  woocommerce: "11.3.1",
  "wordpress-seo": "28.9",
  jetpack: "16.4",
  "wpforms-lite": "2.0.5.1",
  akismet: "5.7.2",
  "litespeed-cache": "7.9.3",
  wordfence: "9.1.1",
  "really-simple-ssl": "9.8.4",
  updraftplus: "1.26.16",
  "classic-editor": "1.7.0",
};

/**
 * Platforms whose vendor has ended security support. Each date is the
 * vendor's own published end-of-life date.
 */
export const END_OF_LIFE: Array<{ cms: "Drupal" | "Joomla"; major: number; ended: string; source: string }> = [
  { cms: "Drupal", major: 7, ended: "2025-01-05", source: "https://www.drupal.org/about/core/policies/core-release-cycles/schedule" },
  { cms: "Joomla", major: 3, ended: "2023-08-17", source: "https://magazine.joomla.org/all-issues/july-2023/extended-security-support-for-joomla-3x" },
];

/** -1, 0 or 1. Missing parts count as 0, so 6.4 equals 6.4.0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((x) => parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d < 0 ? -1 : 1;
  }
  return 0;
}
