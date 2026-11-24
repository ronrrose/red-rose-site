/** Rate limits. The first two are from the brief; the rest keep the other routes from being abused. */
export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

/** 3 scans per IP per hour. */
export const SCANS_PER_IP_PER_HOUR = 3;
/** 1 scan per domain per 24 hours. */
export const DOMAIN_WINDOW_MS = DAY_MS;
/** Report requests (each sends two emails). */
export const REPORTS_PER_IP_PER_HOUR = 5;
/** One scan's result can be emailed at most this many times. */
export const REPORTS_PER_SCAN = 2;
/** Reports to any one address per day, from any scan. */
export const REPORTS_PER_RECIPIENT_PER_DAY = 2;
/** Exposed-files runs from emailed links. */
export const FILES_RUNS_PER_IP_PER_HOUR = 3;
/** How long an emailed unlock link works. */
export const UNLOCK_TTL_SECONDS = 7 * 24 * 60 * 60;
/** CAN-SPAM needs an opt-out to keep working at least 30 days after each send; this is far longer. */
export const UNSUB_TTL_SECONDS = 400 * 24 * 60 * 60;
