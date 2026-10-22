/**
 * The SMS consent wording.
 *
 * Stored verbatim against each lead that ticks the box, because the record of
 * what someone agreed to is only worth anything if it is the exact text they
 * were shown. Changing this string changes what new leads consent to; it does
 * not retroactively change what earlier ones agreed to.
 */
export const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Red Rose Technologies about my request. " +
  "Message and data rates may apply. Reply STOP to opt out.";
