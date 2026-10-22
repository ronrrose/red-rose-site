#!/usr/bin/env node
/**
 * Apply pending SQL migrations.
 *
 * Usage: npm run migrate
 *
 * Reads DATABASE_URL from the environment, or from .env.local.
 *
 * Deliberately a script and not a route: running schema changes at request
 * time would race across concurrent serverless instances.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

/*
 * Resolve the connection string.
 *
 * Environment first, then .env.local. The file path exists so that running
 * this needs no argument at all: a connection string pasted into a shell
 * command is a string that ends up in shell history, and a command written
 * with a placeholder in it is a command someone will run with the
 * placeholder still in place.
 */
const url = readDatabaseUrl();

function readDatabaseUrl() {
  const fromEnv = process.env.DATABASE_URL?.trim();
  if (fromEnv) return checkReal(fromEnv, "the DATABASE_URL environment variable");

  const envLocal = readEnvLocal();
  const fromFile = envLocal.DATABASE_URL?.trim();
  if (fromFile) return checkReal(fromFile, ".env.local");

  // The key is present but has no value. Saying "not found" here would send
  // someone looking for a line that is already in the file.
  if ("DATABASE_URL" in envLocal) {
    fail(
      "DATABASE_URL is in .env.local but has no value.",
      "",
      "Paste the connection string after the `=` on that line, so it reads:",
      "",
      "  DATABASE_URL=postgres://USER:PASSWORD@ep-xxxx.aws.neon.tech/neondb?sslmode=require",
      "",
      "Get that string from the Neon or Vercel storage dashboard. If you have",
      "not created the database yet: Vercel dashboard > Storage >",
      "Create Database > Neon (free tier)."
    );
  }

  fail(
    "No DATABASE_URL found.",
    "",
    "Create the database first: Vercel dashboard > Storage > Create Database >",
    "Neon (free tier). Then copy its connection string into .env.local, which",
    "is gitignored:",
    "",
    "  echo 'DATABASE_URL=the-connection-string-you-copied' >> .env.local",
    "",
    "Then run `npm run migrate` again, with no arguments."
  );
}

/**
 * Reject a value that is obviously still a stand-in.
 *
 * Every placeholder shape any of this project's docs has ever used, plus the
 * usual suspects. Better to refuse than to hand someone a driver stack trace
 * about URL schemes, which says nothing about the actual mistake.
 */
function checkReal(value, origin) {
  const looksLikePlaceholder =
    value.includes("...") ||
    /[<>]/.test(value) ||
    /\b(paste|your|example|placeholder|changeme|user:password)\b/i.test(value) ||
    /^postgres(ql)?:\/\/?$/.test(value);

  if (looksLikePlaceholder) {
    fail(
      `DATABASE_URL in ${origin} is still a placeholder, not a real connection string:`,
      "",
      `  ${value}`,
      "",
      "Copy the real one from the Neon or Vercel storage dashboard. It has a",
      "host and a password in it, and looks like:",
      "",
      "  postgres://USER:PASSWORD@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
    );
  }

  if (!/^postgres(ql)?:\/\//.test(value)) {
    fail(
      `DATABASE_URL in ${origin} does not look like a Postgres URL:`,
      "",
      `  ${value}`,
      "",
      "It must start with postgres:// or postgresql://"
    );
  }

  return value;
}

/** Minimal .env parser. Avoids a dependency for one variable. */
function readEnvLocal() {
  const out = {};
  let text;
  try {
    text = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  } catch {
    return out;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip one layer of matching quotes, the way dotenv does.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function fail(...lines) {
  for (const line of lines) console.error(line);
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
