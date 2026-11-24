/**
 * Name and practice name go into an email and a PDF that we send to an
 * address nobody has verified yet. They are the only free text in either, so
 * they are held to what a person's name or a practice's name looks like:
 * letters (any language), digits for the practice only, spaces and basic
 * punctuation. Anything that reads as a link, an email address or a phone
 * number is refused, so the report cannot carry someone else's message.
 */

// Built with RegExp so the Unicode flag works under this repo's ES5 TypeScript target.
const NAME = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M} .'-]{0,98}[\\p{L}\\p{M}.]$", "u");
const PRACTICE = new RegExp("^[\\p{L}\\p{M}\\p{N}][\\p{L}\\p{M}\\p{N} .,'&()-]{0,146}[\\p{L}\\p{M}\\p{N}.)]$", "u");

/** Something a mail client or PDF reader would turn into a link. */
const LINK_LIKE = /(:\/\/|www\.|@|[a-z0-9-]\.(?:[a-z]{2,24})(?:\b|$))/i;
/** Seven or more digits anywhere reads as a phone number. */
const PHONE_LIKE = /(\d\D{0,2}){7,}/;

export type FieldCheck = { ok: true; value: string } | { ok: false; message: string };

function clean(s: string): string {
  return s.normalize("NFC").replace(/\s+/g, " ").trim();
}

export function checkName(raw: string): FieldCheck {
  const v = clean(raw);
  if (!NAME.test(v) || LINK_LIKE.test(v)) {
    return { ok: false, message: "Please enter your name using letters only." };
  }
  return { ok: true, value: v };
}

export function checkPractice(raw: string): FieldCheck {
  const v = clean(raw);
  if (!PRACTICE.test(v) || LINK_LIKE.test(v) || PHONE_LIKE.test(v)) {
    return {
      ok: false,
      message: "Please enter your practice's name using letters, numbers and basic punctuation, without a web address or phone number.",
    };
  }
  return { ok: true, value: v };
}
