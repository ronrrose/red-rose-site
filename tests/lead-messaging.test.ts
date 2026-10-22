import { describe, it, expect } from "vitest";
import { confirmationMessage, buildNote, splitName } from "@/lib/leads/create-lead";
import { isOptOutMessage } from "@/lib/quo/messages";
import { escapeMentions, externalIdFor } from "@/lib/quo/contacts";
import { mightContainContactDetails, parseExtraction } from "@/lib/chat/extract-lead";
import { SMS_CONSENT_TEXT } from "@/lib/consent";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_TTL_SECONDS,
} from "@/lib/admin/session";

describe("confirmationMessage", () => {
  it("is the exact approved wording", () => {
    expect(confirmationMessage("Jane Doe")).toBe(
      "Hi Jane, this is Red Rose Technologies. We got your request and someone from our team will call you. Reply STOP to opt out."
    );
  });

  it("never names an individual at the company", () => {
    expect(confirmationMessage("Jane")).not.toMatch(/\bRon\b/);
  });

  it("includes the opt-out instruction carriers require", () => {
    expect(confirmationMessage("Jane")).toContain("Reply STOP to opt out.");
  });

  it("greets neutrally when no name was given", () => {
    expect(confirmationMessage(null)).toContain("Hi there,");
  });

  it("stays within a single SMS segment for a typical name", () => {
    // GSM-7 concatenated segments are 153 chars; this is one message's worth
    // of billing either way, but keeping it short keeps the cost predictable.
    expect(confirmationMessage("Jane").length).toBeLessThan(160 * 2);
  });
});

describe("SMS_CONSENT_TEXT", () => {
  it("discloses the sender, the rates and the opt-out", () => {
    expect(SMS_CONSENT_TEXT).toContain("Red Rose Technologies");
    expect(SMS_CONSENT_TEXT).toContain("Message and data rates may apply");
    expect(SMS_CONSENT_TEXT).toContain("Reply STOP to opt out");
  });
});

describe("isOptOutMessage", () => {
  it("recognises the carrier keywords in any case or punctuation", () => {
    for (const text of ["STOP", "stop", "Stop.", " STOP ", "unsubscribe", "CANCEL", "quit", "End", "optout", "opt-out"]) {
      expect(isOptOutMessage(text), text).toBe(true);
    }
  });

  it("does not treat an ordinary message as an opt-out", () => {
    for (const text of [
      "Can you stop by on Tuesday?",
      "stop the server please",
      "Our network keeps dropping",
      "",
      null,
      undefined,
    ]) {
      expect(isOptOutMessage(text as string), String(text)).toBe(false);
    }
  });
});

describe("escapeMentions", () => {
  it("neutralises Quo mention syntax so a lead cannot tag a real user", () => {
    expect(escapeMentions("Ask @US123abc about it")).toBe("Ask [at]US123abc about it");
    expect(escapeMentions("@GR99 and @OR42")).toBe("[at]GR99 and [at]OR42");
  });

  it("leaves ordinary text and email addresses alone", () => {
    expect(escapeMentions("Email jane@example.com")).toBe("Email jane@example.com");
    expect(escapeMentions("Costs went up 20%")).toBe("Costs went up 20%");
  });
});

describe("externalIdFor", () => {
  it("prefers the phone, which is how calls and texts arrive", () => {
    expect(externalIdFor("+19415551234", "jane@example.com")).toBe("+19415551234");
  });

  it("falls back to a namespaced email when there is no phone", () => {
    expect(externalIdFor(null, "jane@example.com")).toBe("email:jane@example.com");
  });

  it("is null when there is no identity to key on", () => {
    expect(externalIdFor(null, null)).toBeNull();
  });
});

describe("splitName", () => {
  it("splits into the firstName Quo requires plus the remainder", () => {
    expect(splitName("Jane Doe")).toEqual({ firstName: "Jane", lastName: "Doe" });
    expect(splitName("Maria De La Cruz")).toEqual({ firstName: "Maria", lastName: "De La Cruz" });
  });

  it("handles a single name", () => {
    expect(splitName("Cher")).toEqual({ firstName: "Cher", lastName: null });
  });

  it("falls back to a placeholder rather than sending an empty firstName", () => {
    // Quo rejects a create without firstName, which would lose the lead.
    expect(splitName(null)).toEqual({ firstName: "Website", lastName: "Lead" });
    expect(splitName("   ")).toEqual({ firstName: "Website", lastName: "Lead" });
  });
});

describe("buildNote", () => {
  const contact = {
    source: "website_form",
    source_url: "https://www.redrosetechnologies.com/en/contact",
    consent_sms: true,
    company: "Bayside Dental",
    role: "Office Manager",
  };

  it("labels the source, page, company, UTMs and consent", () => {
    const note = buildNote(contact, {
      summary: "Eaglesoft is slow and backups are unverified.",
      utm: { utm_source: "google", utm_campaign: "dental-it" },
      pageUrl: "https://www.redrosetechnologies.com/en/contact",
    });

    expect(note).toContain("Source: website_form");
    expect(note).toContain("Page: https://www.redrosetechnologies.com/en/contact");
    expect(note).toContain("Company: Bayside Dental");
    expect(note).toContain("Role: Office Manager");
    expect(note).toContain("UTM: utm_campaign=dental-it utm_source=google");
    expect(note).toContain("SMS consent: yes");
    expect(note).toContain("Eaglesoft is slow and backups are unverified.");
  });

  it("records the absence of consent explicitly rather than omitting it", () => {
    const note = buildNote({ ...contact, consent_sms: false }, { summary: null, utm: null, pageUrl: null });
    expect(note).toContain("SMS consent: no");
  });

  it("orders UTM keys deterministically", () => {
    const a = buildNote(contact, { summary: null, pageUrl: null, utm: { utm_source: "x", utm_medium: "y" } });
    const b = buildNote(contact, { summary: null, pageUrl: null, utm: { utm_medium: "y", utm_source: "x" } });
    expect(a).toBe(b);
  });
});

describe("mightContainContactDetails", () => {
  it("passes text with a phone number or an email through to extraction", () => {
    for (const text of [
      "call me on 941 555 1234",
      "(941) 555-1234",
      "9415551234",
      "jane@example.com",
      "my email is Jane.Doe@practice.co.uk",
    ]) {
      expect(mightContainContactDetails(text), text).toBe(true);
    }
  });

  it("filters out the ordinary turns, so most chats cost nothing extra", () => {
    for (const text of [
      "Do you support Dentrix?",
      "We have 12 staff",
      "Our server is 3 years old",
      "What does managed IT cost?",
      "",
    ]) {
      expect(mightContainContactDetails(text), text).toBe(false);
    }
  });
});

describe("parseExtraction", () => {
  it("parses a plain JSON object", () => {
    const parsed = parseExtraction('{"name":"Jane","phone":"941-555-1234","email":null,"company":null,"summary":"Slow server."}');
    expect(parsed).toEqual({
      name: "Jane",
      phone: "941-555-1234",
      email: null,
      company: null,
      summary: "Slow server.",
    });
  });

  it("tolerates a code fence around the JSON", () => {
    const parsed = parseExtraction('```json\n{"name":"Jane","phone":null,"email":null,"company":null,"summary":null}\n```');
    expect(parsed?.name).toBe("Jane");
  });

  it('treats the string "null" as absent', () => {
    const parsed = parseExtraction('{"name":"null","phone":"  ","email":null,"company":null,"summary":null}');
    expect(parsed?.name).toBeNull();
    expect(parsed?.phone).toBeNull();
  });

  it("returns null for output that is not JSON at all", () => {
    expect(parseExtraction("I could not find any contact details.")).toBeNull();
    expect(parseExtraction("")).toBeNull();
  });

  it("ignores prose wrapped around the object", () => {
    const parsed = parseExtraction(
      'Here you go: {"name":"Jane","phone":null,"email":null,"company":null,"summary":null} Hope that helps.'
    );
    expect(parsed?.name).toBe("Jane");
  });
});

describe("admin session tokens", () => {
  const SECRET = "a-test-session-secret-at-least-32-chars";
  const NOW = 1_800_000_000;

  it("accepts a token it just minted", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW)).toBe(true);
  });

  it("rejects a token once it has expired", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, SECRET, NOW + SESSION_TTL_SECONDS + 1)).toBe(false);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("some-other-secret-value-here-ok", NOW);
    expect(await verifySessionToken(token, SECRET, NOW)).toBe(false);
  });

  it("cannot be extended by editing the expiry", async () => {
    // The expiry is inside the signed payload, so rewriting it breaks the MAC.
    const token = await createSessionToken(SECRET, NOW);
    const signature = token.slice(token.lastIndexOf(".") + 1);
    const forged = `${NOW + 999_999}.${signature}`;
    expect(await verifySessionToken(forged, SECRET, NOW)).toBe(false);
  });

  it("rejects a malformed or empty token", async () => {
    for (const token of ["", "nodot", ".", `${NOW + 3600}.`, "abc.def"]) {
      expect(await verifySessionToken(token, SECRET, NOW), JSON.stringify(token)).toBe(false);
    }
  });

  it("rejects an expiry that is not plain integer seconds", async () => {
    for (const raw of ["0x6b8b4567", " 1800003600 ", "1e12", "+1800003600"]) {
      const forged = `${raw}.anything`;
      expect(await verifySessionToken(forged, SECRET, NOW), raw).toBe(false);
    }
  });

  it("fails closed when no secret is configured", async () => {
    const token = await createSessionToken(SECRET, NOW);
    expect(await verifySessionToken(token, undefined, NOW)).toBe(false);
  });
});
