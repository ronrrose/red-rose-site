import type { CheckId, FindingId } from "@/lib/security-check/types";

/**
 * Plain-English wording for every finding the scanner can raise.
 *
 * STATUS: DRAFT, awaiting Ron's approval. Nothing here goes live until he has
 * read every sentence.
 *
 * Written once by Claude (claude-opus-5-5) on 2026-11-24 and committed as
 * static copy, so no scan ever calls a model and no visitor data leaves the
 * site to produce this text. scripts/generate-finding-library.mjs can redraft
 * it through the API; any redraft is reviewed the same way before it ships.
 *
 * Rules every entry follows (tests/security-check-copy.test.ts enforces the
 * mechanical ones): no em dashes, no statistics, no invented facts, no promise
 * of an outcome, sentence case titles, a fix that fits on one line, and "why"
 * written for the person who runs a dental office, not for an IT department.
 */

export type FindingCopy = {
  check: CheckId;
  title: string;
  why: string;
  fix: string;
};

export const FINDING_LIBRARY: Record<FindingId, FindingCopy> = {
  /* ── HTTPS ── */
  https_unreachable: {
    check: "https",
    title: "Your website does not load securely",
    why: "Browsers mark a site without HTTPS as not secure, and anything a patient types into it, like a name or phone number, travels without encryption. That is the first thing a cautious patient notices.",
    fix: "Ask your web host to turn on a free HTTPS certificate and send every visit to the https:// address.",
  },
  https_cert_invalid: {
    check: "https",
    title: "Your security certificate has a problem",
    why: "When the certificate is expired, self-signed or issued for another name, browsers show patients a full-page warning before they reach you. Most people leave at that point, and some will wonder whether the office itself is safe.",
    fix: "Have your web host renew or reissue the certificate for your exact website name and turn on automatic renewal.",
  },
  https_cert_expiring: {
    check: "https",
    title: "Your security certificate expires soon",
    why: "When it lapses, patients see a browser warning instead of your website, and online booking stops working until someone fixes it.",
    fix: "Renew the certificate now and confirm automatic renewal is switched on with your web host.",
  },
  http_no_redirect: {
    check: "https",
    title: "Plain HTTP visits are not moved to HTTPS",
    why: "Anyone who types your address without https, or follows an old link, gets an unencrypted page. On public Wi-Fi in a waiting room, that page can be read or changed in transit.",
    fix: "Set your site or host to permanently redirect every http:// request to https://.",
  },

  /* ── Headers ── */
  headers_missing: {
    check: "headers",
    title: "Some browser security settings are missing",
    why: "Security headers tell a visitor's browser how to protect your pages, for example to refuse being framed inside a fake site or to always use HTTPS. Without them, your site leans on the browser's weakest defaults.",
    fix: "Ask your web developer or host to add the missing headers listed above; most hosts can set them in one place.",
  },

  /* ── Email ── */
  spf_missing: {
    check: "email",
    title: "Nothing says who may send email as your practice",
    why: "Without an SPF record, anyone can send email that claims to come from your domain, such as a fake invoice to your staff or a fake billing notice to your patients, and receiving servers have no list to check it against.",
    fix: "Publish one SPF record in your DNS that lists your real email provider and ends in -all or ~all.",
  },
  spf_multiple: {
    check: "email",
    title: "Your domain has more than one SPF record",
    why: "The email standard allows only one. With two, receiving servers treat your SPF as broken, which can send your real email to spam and leaves spoofed email unchecked.",
    fix: "Merge the SPF records into a single record that lists every service that sends email for you.",
  },
  spf_permissive: {
    check: "email",
    title: "Your SPF record does not block other senders",
    why: "SPF only helps if it ends by telling receiving servers what to do with senders not on your list. As set now, it gives them no reason to reject an impostor.",
    fix: "End the SPF record with -all, or ~all while you confirm every legitimate sender is listed.",
  },
  dmarc_missing: {
    check: "email",
    title: "No DMARC policy protects your email name",
    why: "DMARC is what tells Gmail, Outlook and other providers to reject email that fakes your domain. Without it, a scammer can email your patients or vendors as your office, and providers have no instruction to stop it.",
    fix: "Publish a DMARC record at _dmarc on your domain, start at p=none to watch reports, then move to quarantine or reject.",
  },
  dmarc_none: {
    check: "email",
    title: "Your DMARC policy only watches, it does not block",
    why: "A policy of none means providers report fake email that uses your name but still deliver it. It is a sensible first step, and a risky place to stay.",
    fix: "Once your real senders pass, change the DMARC policy from p=none to p=quarantine, then p=reject.",
  },
  dmarc_partial: {
    check: "email",
    title: "Your DMARC policy covers only part of your email",
    why: "A pct value below 100 tells providers to apply your policy to only some of the email that fails the check, so the rest of the fakes still get through.",
    fix: "Raise pct to 100, or remove it, once you have confirmed your legitimate email passes.",
  },
  dkim_not_found: {
    check: "email",
    title: "We could not find a DKIM signing key",
    why: "DKIM adds a signature that proves an email really came from your practice and was not changed on the way. We only look in the common places, so your provider may use a name we did not check.",
    fix: "Ask your email provider to confirm DKIM signing is turned on for your domain and the key is published in DNS.",
  },

  /* ── CMS ── */
  cms_core_insecure: {
    check: "cms",
    title: "Your website software has known security problems",
    why: "WordPress itself lists this version as insecure, which means fixes for known weaknesses exist and are not installed. Attackers scan for exactly these versions because they are easy to find.",
    fix: "Back up the site, then update WordPress to the current release and turn on automatic security updates.",
  },
  cms_core_outdated: {
    check: "cms",
    title: "Your website software is behind the current release",
    why: "This version still receives security fixes, but it is not the newest, and the gap tends to grow. Staying current keeps your site on the path WordPress tests and patches first.",
    fix: "Back up the site and update WordPress to the current release during a quiet hour.",
  },
  cms_eol: {
    check: "cms",
    title: "Your website runs on software that no longer gets security fixes",
    why: "The maker of this platform has ended security support, so any weakness found from now on stays open. A practice website on it is an easy target and a poor first impression if it is defaced.",
    fix: "Plan a move to a supported platform or version, and ask your developer for a timeline this quarter.",
  },
  cms_version_exposed: {
    check: "cms",
    title: "Your website shows its software version to everyone",
    why: "Publishing the exact version saves an attacker a step: they can match it to known weaknesses without testing anything. We could not confirm from our list whether this version is current.",
    fix: "Confirm the software is up to date, then remove the version number from the page's generator tag.",
  },
  plugin_outdated: {
    check: "cms",
    title: "Some website plugins are behind the current release",
    why: "Plugins add features like forms and booking, and older plugin versions are a common way into small business websites. The version numbers are visible in your page's file addresses.",
    fix: "Back up the site, update the plugins listed above, and remove any plugin the practice no longer uses.",
  },

  /* ── Forms ── */
  form_on_http_page: {
    check: "forms",
    title: "A form on your homepage is not encrypted",
    why: "Your homepage loads over plain HTTP, so whatever a patient types into its form, such as a name, phone number or reason for visit, travels unencrypted. The HIPAA Security Rule asks practices to protect patient information in transit.",
    fix: "Turn on HTTPS for the whole site and redirect every http:// visit to https://.",
  },
  form_http_action: {
    check: "forms",
    title: "A form or booking frame sends information without encryption",
    why: "The page is secure, but the form or embedded booking tool sends what patients type to a plain http:// address. Browsers may block it outright or warn the patient, and the information is not protected on the way.",
    fix: "Change the form or booking embed to its https:// address; your booking vendor can confirm the right link.",
  },
  booking_link_http: {
    check: "forms",
    title: "Booking or contact links use plain HTTP",
    why: "Links that start with http:// can send patients to an unencrypted page before they book or reach out, and some browsers will warn them on the way.",
    fix: "Update these links to their https:// versions.",
  },
};

/** One positive line per check, used when a scan finds fewer than three issues. */
export const STRENGTH_TITLES: Record<CheckId, string> = {
  https: "Your website loads securely",
  headers: "Browser security settings are in place",
  email: "Your email name is protected against spoofing",
  cms: "No outdated website software is visible",
  forms: "Your forms and booking links are encrypted",
};
