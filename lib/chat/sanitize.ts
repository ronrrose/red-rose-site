/**
 * Wrapper-markup stripping for streamed chat replies.
 *
 * The model occasionally leaks wrapper markup into its visible text, e.g. a
 * reply that opens with "antml:final_response". The system prompt tells it
 * not to, but that is guidance, not a guarantee, so strip it server-side too.
 *
 * Extracted from the route so the behaviour is directly testable. This is the
 * one thing in the chat path that has already broken in production.
 */

/**
 * Matches both the tag forms (<x>, </x>) and the bare token form that
 * actually showed up in production.
 */
export const ANTML_MARKUP = /<\/?antml:[a-zA-Z0-9_.:-]*>?|antml:[a-zA-Z0-9_.:-]+/gi;

/**
 * Longest partial marker we might be holding mid-stream. Deltas can split a
 * token across chunks, so we never emit the final TAIL_HOLD characters until
 * more text arrives or the stream ends.
 */
export const TAIL_HOLD = 32;

export function stripAntml(text: string): string {
  // The regex is global, so reset lastIndex: a shared global regex carries
  // state between calls and would skip matches on the second use.
  ANTML_MARKUP.lastIndex = 0;
  return text.replace(ANTML_MARKUP, "");
}

/**
 * Incremental cleaner for a token stream.
 *
 * Two rules make this correct, and both are easy to get wrong:
 *
 *   1. Strip against the whole accumulated reply, never against a single
 *      delta. Deltas can arrive one character at a time, and a marker seen
 *      chunk by chunk is never recognisable.
 *   2. Hold back the last few characters of the CLEANED output, so a marker
 *      still being written at the end of the stream is not emitted before it
 *      completes.
 *
 * The transform must be deterministic, or the emitted offset drifts, so the
 * leading whitespace is normalised the same way on every pass.
 */
export function createStreamCleaner(): {
  push: (delta: string) => string;
  end: () => string;
} {
  let raw = "";
  let emitted = 0;

  const cleanedSoFar = () => stripAntml(raw).replace(/^\s+/, "");

  const flush = (holdBack: number): string => {
    const cleaned = cleanedSoFar();
    const upto = Math.max(emitted, cleaned.length - holdBack);
    if (upto <= emitted) return "";
    const chunk = cleaned.slice(emitted, upto);
    emitted = upto;
    return chunk;
  };

  return {
    push(delta: string) {
      raw += delta;
      return flush(TAIL_HOLD);
    },
    end() {
      return flush(0);
    },
  };
}
