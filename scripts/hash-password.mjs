#!/usr/bin/env node
/**
 * Generate an ADMIN_PASSWORD_HASH value.
 *
 * Usage: node scripts/hash-password.mjs
 * Reads the password from stdin so it never lands in shell history.
 */
import crypto from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stderr, terminal: true });

rl.question("Password: ", (password) => {
  rl.close();
  if (!password) {
    console.error("No password given.");
    process.exit(1);
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  process.stdout.write(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}\n`);
});
