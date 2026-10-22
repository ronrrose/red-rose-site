import { describe, it, expect } from "vitest";
import { stripAntml, createStreamCleaner, TAIL_HOLD } from "@/lib/chat/sanitize";

/**
 * The wrapper-markup namespace, assembled at runtime rather than written as a
 * literal. Tooling in this repo's authoring path rewrites the literal tag
 * form, which would silently weaken these fixtures into testing nothing.
 */
const NS = ["ant", "ml:"].join("");

/** Feed a whole reply through the cleaner in fixed-size chunks. */
function streamInChunks(text: string, size: number): string {
  const cleaner = createStreamCleaner();
  let out = "";
  for (let i = 0; i < text.length; i += size) {
    out += cleaner.push(text.slice(i, i + size));
  }
  out += cleaner.end();
  return out;
}

describe("stripAntml", () => {
  it("removes the bare token form seen in production", () => {
    expect(stripAntml("antml:final_response Hello there")).toBe(" Hello there");
  });

  it("removes opening and closing tag forms", () => {
    expect(stripAntml(`<${NS}invoke>hidden</${NS}invoke>visible`)).toBe("hiddenvisible");
    expect(stripAntml(`<${NS}function_calls>x</${NS}function_calls>`)).toBe("x");
  });

  it("removes an unterminated tag still being written", () => {
    expect(stripAntml(`<${NS}inv`)).toBe("");
    expect(stripAntml(`</${NS}`)).toBe("");
  });

  it("is case-insensitive", () => {
    expect(stripAntml("ANTML:FINAL_RESPONSE ok")).toBe(" ok");
    expect(stripAntml(`<${NS.toUpperCase()}INVOKE>x`)).toBe("x");
  });

  it("leaves markup outside the namespace alone", () => {
    // The pattern is deliberately scoped to this one namespace. Stripping
    // every <tag> would mangle a reply that discusses HTML or config syntax.
    expect(stripAntml("<thinking>kept</thinking>")).toBe("<thinking>kept</thinking>");
    expect(stripAntml("Set <VirtualHost *:443> in the config.")).toBe(
      "Set <VirtualHost *:443> in the config."
    );
  });

  it("removes every occurrence, not just the first", () => {
    // Regression guard: a global regex that keeps lastIndex between calls
    // silently skips matches on a later invocation.
    expect(stripAntml("antml:a and antml:b and antml:c")).toBe(" and  and ");
    expect(stripAntml("antml:a and antml:b and antml:c")).toBe(" and  and ");
  });

  it("leaves ordinary text alone", () => {
    const text = "We support Dentrix, Eaglesoft and Open Dental. Call (941) 206-4709.";
    expect(stripAntml(text)).toBe(text);
  });

  it("does not eat unrelated angle brackets or colons", () => {
    expect(stripAntml("Uptime < 1% loss; ratio 3:1")).toBe("Uptime < 1% loss; ratio 3:1");
  });

  it("does not touch a word that merely contains antml", () => {
    expect(stripAntml("transantmlation")).toBe("transantmlation");
  });
});

describe("createStreamCleaner", () => {
  it("emits a clean reply regardless of how the stream is chunked", () => {
    const raw = "antml:final_response Managed IT keeps your network monitored around the clock.";
    const expected = "Managed IT keeps your network monitored around the clock.";

    // One character at a time is the case that defeats per-delta stripping.
    for (const size of [1, 2, 3, 5, 7, 16, 64, 1000]) {
      expect(streamInChunks(raw, size), `chunk size ${size}`).toBe(expected);
    }
  });

  it("never emits a marker that is split across deltas", () => {
    const cleaner = createStreamCleaner();
    let out = "";
    for (const delta of ["an", "tml", ":fin", "al_res", "ponse", " Hi there, how can we help?"]) {
      out += cleaner.push(delta);
    }
    out += cleaner.end();
    expect(out).toBe("Hi there, how can we help?");
    expect(out).not.toContain("antml");
  });

  it("strips a marker that only completes at the very end of the stream", () => {
    const cleaner = createStreamCleaner();
    let out = cleaner.push("All set. antml:");
    out += cleaner.push("final_response");
    out += cleaner.end();
    // Only the marker is removed. Surrounding whitespace is left as the model
    // wrote it, so the stripper never changes the shape of a clean reply.
    expect(out).toBe("All set. ");
    expect(out).not.toContain("antml");
  });

  it("trims leading whitespace once and keeps the rest of the text intact", () => {
    expect(streamInChunks("\n\n  Hello.  Second sentence.", 4)).toBe("Hello.  Second sentence.");
  });

  it("holds back the tail until the stream ends", () => {
    const cleaner = createStreamCleaner();
    const emitted = cleaner.push("0123456789");
    // Shorter than the hold window, so nothing is safe to emit yet.
    expect(emitted).toBe("");
    expect(cleaner.end()).toBe("0123456789");
  });

  it("starts emitting once the text exceeds the hold window", () => {
    const cleaner = createStreamCleaner();
    const text = "x".repeat(TAIL_HOLD + 10);
    expect(cleaner.push(text)).toBe("x".repeat(10));
    expect(cleaner.end()).toBe("x".repeat(TAIL_HOLD));
  });

  it("emits each character exactly once with no drift or duplication", () => {
    const raw = "antml:final_response " + "The quick brown fox. ".repeat(20) + "antml:done";
    const expected = ("The quick brown fox. ".repeat(20)).replace(/^\s+/, "");
    expect(streamInChunks(raw, 3)).toBe(expected);
    expect(streamInChunks(raw, 1)).toBe(expected);
  });

  it("returns nothing for an empty stream", () => {
    const cleaner = createStreamCleaner();
    expect(cleaner.end()).toBe("");
  });
});
