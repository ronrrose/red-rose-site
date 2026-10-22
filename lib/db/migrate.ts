import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { requireDb } from "@/lib/db/client";

/**
 * Minimal forward-only migration runner.
 *
 * Each .sql file in ./migrations runs once, in filename order, and is recorded
 * in schema_migrations. The files are written to be idempotent anyway
 * (CREATE TABLE IF NOT EXISTS), so a partially applied migration can be
 * re-run safely.
 *
 * Invoked from scripts/migrate.mjs, never at request time: schema changes
 * during a request would race across concurrent function instances.
 */
export async function runMigrations(): Promise<string[]> {
  const db = requireDb();

  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = new Set(
    (
      (await db.query("SELECT name FROM schema_migrations")) as Array<{
        name: string;
      }>
    ).map((r) => r.name)
  );

  const dir = join(process.cwd(), "lib", "db", "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const ran: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(dir, file), "utf8");
    // Statement-by-statement: the HTTP driver sends one statement per request,
    // so a whole-file multi-statement string is rejected.
    for (const statement of splitStatements(sql)) {
      await db.query(statement);
    }
    await db.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    ran.push(file);
  }
  return ran;
}

/**
 * Split a .sql file into statements on semicolons, ignoring semicolons inside
 * string literals, dollar-quoted blocks and line comments.
 */
function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let buf = "";
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (ch === "'") {
      const end = findClosingQuote(sql, i);
      buf += sql.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    if (ch === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (tag) {
        const close = sql.indexOf(tag[0], i + tag[0].length);
        const end = close === -1 ? sql.length : close + tag[0].length;
        buf += sql.slice(i, end);
        i = end;
        continue;
      }
    }

    if (ch === ";") {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      i += 1;
      continue;
    }

    buf += ch;
    i += 1;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Index of the quote that closes the single-quoted literal starting at `start`. */
function findClosingQuote(sql: string, start: number): number {
  let i = start + 1;
  while (i < sql.length) {
    if (sql[i] === "'") {
      if (sql[i + 1] === "'") {
        i += 2; // escaped quote
        continue;
      }
      return i;
    }
    i += 1;
  }
  return sql.length - 1;
}
