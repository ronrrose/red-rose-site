#!/usr/bin/env node
/**
 * Apply pending SQL migrations.
 *
 * Usage: DATABASE_URL=... node scripts/migrate.mjs
 *
 * Deliberately a script and not a route: running schema changes at request
 * time would race across concurrent serverless instances.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const db = neon(url);

await db.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const appliedRows = await db.query("SELECT name FROM schema_migrations");
const applied = new Set(appliedRows.map((r) => r.name));

const dir = join(process.cwd(), "lib", "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

let ran = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip ${file}`);
    continue;
  }
  const sql = readFileSync(join(dir, file), "utf8");
  for (const statement of splitStatements(sql)) {
    await db.query(statement);
  }
  await db.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
  console.log(`applied ${file}`);
  ran += 1;
}
console.log(ran === 0 ? "Nothing to apply." : `Applied ${ran} migration(s).`);

function splitStatements(sql) {
  const out = [];
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
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'") {
          if (sql[j + 1] === "'") { j += 2; continue; }
          break;
        }
        j += 1;
      }
      buf += sql.slice(i, j + 1);
      i = j + 1;
      continue;
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
