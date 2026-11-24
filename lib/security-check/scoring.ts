import { FINDING_LIBRARY, STRENGTH_TITLES } from "@/lib/security-check/finding-library";
import type { CheckResult, ResolvedFinding, ScanResult, Strength } from "@/lib/security-check/types";

/**
 * Score: each check earns its full weight for pass, half for warn, nothing
 * for fail. Skipped and errored checks are left out of both sides, so a
 * check we could not run never counts against the practice.
 */
export function scoreChecks(checks: CheckResult[]): number {
  let earned = 0;
  let possible = 0;
  for (const c of checks) {
    if (c.status === "skipped" || c.status === "error") continue;
    possible += c.weight;
    if (c.status === "pass") earned += c.weight;
    else if (c.status === "warn") earned += c.weight / 2;
  }
  return possible === 0 ? 0 : Math.round((earned / possible) * 100);
}

export function gradeFor(score: number): ScanResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export const MAX_FINDINGS = 5;
export const MIN_ITEMS = 3;

/** Fails before warns, then the heavier check first, then check order. */
export function topFindings(checks: CheckResult[], max = MAX_FINDINGS): ResolvedFinding[] {
  const all: Array<ResolvedFinding & { order: number; weight: number }> = [];
  checks.forEach((c, ci) => {
    c.findings.forEach((f, fi) => {
      const copy = FINDING_LIBRARY[f.id];
      all.push({ ...f, check: c.id, title: copy.title, why: copy.why, fix: copy.fix, order: ci * 100 + fi, weight: c.weight });
    });
  });
  all.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "fail" ? -1 : 1;
    if (a.weight !== b.weight) return b.weight - a.weight;
    return a.order - b.order;
  });
  return all.slice(0, max).map(({ order: _o, weight: _w, ...f }) => f);
}

/** Enough passed checks to make the list at least three items long. */
export function strengths(checks: CheckResult[], findingCount: number): Strength[] {
  const need = Math.max(0, MIN_ITEMS - findingCount);
  if (need === 0) return [];
  return checks
    .filter((c) => c.status === "pass")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, need)
    .map((c) => ({ check: c.id, title: STRENGTH_TITLES[c.id], summary: c.summary }));
}
