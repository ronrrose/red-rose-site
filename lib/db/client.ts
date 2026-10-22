import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Neon over HTTP rather than a TCP pool.
 *
 * Serverless functions scale to many short-lived instances, and a TCP pool
 * per instance exhausts Postgres connections long before it exhausts traffic.
 * The HTTP driver is stateless, so there is nothing to pool.
 */

let cached: NeonQueryFunction<false, false> | null = null;

/**
 * Never throw at module scope. Next evaluates route modules while collecting
 * page data during the build, and a missing DATABASE_URL there would break
 * every deployment the way RESEND_API_KEY once broke every preview.
 */
export function getDb(): NeonQueryFunction<false, false> | null {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached = neon(url);
  return cached;
}

/** Throwing accessor for call sites that cannot proceed without a database. */
export function requireDb(): NeonQueryFunction<false, false> {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not configured");
  return db;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
