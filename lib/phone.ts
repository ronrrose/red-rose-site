/**
 * Phone normalisation to E.164.
 *
 * Every lead is deduped by phone, so this function decides whether two
 * submissions are the same person. It has to be strict: a loose parse that
 * turns a typo into a valid-looking number silently merges two strangers'
 * records, and the Quo contact that results carries the wrong phone.
 *
 * US/Canada default (+1) because Red Rose serves Tampa Bay. An explicit "+"
 * is honoured for anything else.
 */

/** Longest possible E.164 subscriber number, per ITU-T E.164. */
const E164_MAX_DIGITS = 15;

/**
 * Convert a human-typed phone number to E.164, or null when it cannot be
 * trusted.
 *
 * Accepts "(941) 206-4709", "941.206.4709", "1-941-206-4709",
 * "+19412064709", "tel:+1 941 206 4709". Rejects anything that is not a
 * plausible dialable number.
 */
export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;

  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // Keep a leading "+" if present, then reduce to digits. Letters are dropped
  // rather than vanity-decoded: guessing at 1-800-FLOWERS would be inventing
  // a number we were never given.
  const hasPlus = trimmed.replace(/^tel:/i, "").trimStart().startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return null;
  if (digits.length > E164_MAX_DIGITS) return null;

  if (hasPlus) {
    // An explicit country code. E.164 forbids a leading zero on the country
    // code and requires at least 2 digits total.
    if (digits.length < 8 || digits.startsWith("0")) return null;
    return `+${digits}`;
  }

  // No "+": assume North America.
  if (digits.length === 10) {
    return isValidNanp(digits) ? `+1${digits}` : null;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    const national = digits.slice(1);
    return isValidNanp(national) ? `+1${national}` : null;
  }

  // 7-digit local numbers have no area code, so they cannot be deduped or
  // dialled reliably. Anything else without a "+" is too ambiguous to guess.
  return null;
}

/**
 * North American Numbering Plan validity.
 *
 * Area code and exchange both start 2-9, and the exchange's second and third
 * digits cannot be "11" (those are reserved service codes like 911/411).
 * This is what rejects "1234567890" and other filler.
 */
function isValidNanp(tenDigits: string): boolean {
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(tenDigits)) return false;
  const exchange = tenDigits.slice(3, 6);
  if (exchange.endsWith("11")) return false;
  return true;
}

/** Format an E.164 US number for display, e.g. "+19412064709" -> "(941) 206-4709". */
export function formatPhoneForDisplay(e164: string): string {
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  if (!m) return e164;
  return `(${m[1]}) ${m[2]}-${m[3]}`;
}

/** Lower-case and trim an email for use as a dedupe key. Returns null if unusable. */
export function normalizeEmail(input: string | null | undefined): string | null {
  if (!input) return null;
  const email = String(input).trim().toLowerCase();
  if (!email) return null;
  // Deliberately permissive: this is a dedupe key, not an address validator.
  // Rejecting a deliverable-but-unusual address would lose a lead.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (email.length > 254) return null;
  return email;
}

/** First name from a full name string, for the SMS greeting. */
export function firstNameOf(name: string | null | undefined): string {
  if (!name) return "there";
  const first = String(name).trim().split(/\s+/)[0];
  return first || "there";
}
