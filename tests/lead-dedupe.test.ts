import { describe, it, expect, beforeEach, vi } from "vitest";
import { normalizePhone, normalizeEmail } from "@/lib/phone";
// vi.mock is hoisted above this import, and the factory below only touches
// `fake` when a query actually runs, so the static import is safe.
import { findContact, upsertContact } from "@/lib/db/queries";

/**
 * Dedupe behaviour.
 *
 * createLead's dedupe is two things working together: normalisation (tested
 * in phone.test.ts) and the lookup order in findContact, which is phone
 * first, then email. These tests drive findContact and upsertContact against
 * a fake database so the SQL-shaped logic is exercised without a live
 * Postgres.
 */

type Row = Record<string, unknown>;

/**
 * Minimal stand-in for the Neon HTTP driver, implementing only the handful of
 * statements our queries issue. It keys rows the same way the real partial
 * unique indexes do.
 */
function makeFakeDb() {
  const contacts: Row[] = [];
  let nextId = 1;

  const query = vi.fn(async (sql: string, params: unknown[] = []) => {
    const text = sql.replace(/\s+/g, " ").trim();

    if (text.startsWith("SELECT * FROM contacts WHERE phone_e164 =")) {
      return contacts.filter((c) => c.phone_e164 === params[0]).slice(0, 1);
    }
    if (text.startsWith("SELECT * FROM contacts WHERE lower(email) = lower(")) {
      const email = String(params[0]).toLowerCase();
      return contacts
        .filter((c) => typeof c.email === "string" && c.email.toLowerCase() === email)
        .slice(0, 1);
    }
    if (text.startsWith("INSERT INTO contacts")) {
      const [name, phone, email, company, role, source, sourceUrl, consentSms, consentText, consentIp] =
        params as [string | null, string | null, string | null, string | null, string | null, string, string | null, boolean, string | null, string | null];

      // Enforce the unique indexes: a duplicate key is a bug in the caller.
      if (phone && contacts.some((c) => c.phone_e164 === phone)) {
        throw new Error("duplicate key value violates unique constraint contacts_phone_key");
      }
      if (email && contacts.some((c) => String(c.email).toLowerCase() === email.toLowerCase())) {
        throw new Error("duplicate key value violates unique constraint contacts_email_key");
      }

      const row: Row = {
        id: String(nextId++),
        name, phone_e164: phone, email, company, role, source,
        source_url: sourceUrl,
        status: "new", owner: null,
        consent_sms: consentSms,
        consent_text: consentSms ? consentText : null,
        consent_at: consentSms ? "2026-10-21T00:00:00Z" : null,
        consent_ip: consentSms ? consentIp : null,
        do_not_contact: false,
        quo_contact_id: null, quo_sync: "pending",
        quo_synced_at: null, quo_sync_error: null,
        created_at: "2026-10-21T00:00:00Z",
        updated_at: "2026-10-21T00:00:00Z",
      };
      contacts.push(row);
      return [row];
    }
    if (text.startsWith("UPDATE contacts SET name =")) {
      const [id, name, phone, email, company, role, sourceUrl, consentSms, consentText, consentIp] =
        params as [string, string | null, string | null, string | null, string | null, string | null, string | null, boolean, string | null, string | null];
      const row = contacts.find((c) => c.id === id);
      if (!row) return [];

      // COALESCE semantics: a later submission fills gaps, never erases.
      row.name = name ?? row.name;
      row.phone_e164 = row.phone_e164 ?? phone;
      row.email = row.email ?? email;
      row.company = company ?? row.company;
      row.role = role ?? row.role;
      row.source_url = row.source_url ?? sourceUrl;

      // Consent only ever moves false -> true, and stamps when it does.
      if (consentSms && !row.consent_sms) {
        row.consent_sms = true;
        row.consent_text = consentText;
        row.consent_ip = consentIp;
        row.consent_at = "2026-10-22T00:00:00Z";
      }
      row.updated_at = "2026-10-22T00:00:00Z";
      return [row];
    }
    throw new Error(`unexpected SQL: ${text.slice(0, 80)}`);
  });

  return { query, contacts };
}

let fake: ReturnType<typeof makeFakeDb>;

/**
 * The real driver is a tagged-template function that also carries .query;
 * our queries only ever call .query, so that is all the fake needs to expose.
 */
vi.mock("@/lib/db/client", () => ({
  requireDb: () => ({ query: (sql: string, params?: unknown[]) => fake.query(sql, params) }),
  getDb: () => ({ query: (sql: string, params?: unknown[]) => fake.query(sql, params) }),
  isDbConfigured: () => true,
}));

const base = {
  name: "Jane Doe",
  phoneE164: "+19415551234",
  email: "jane@example.com",
  company: null,
  role: null,
  source: "website_form",
  sourceUrl: null,
  consentSms: false,
  consentText: null,
  consentIp: null,
};

beforeEach(() => {
  fake = makeFakeDb();
});

describe("dedupe by phone", () => {
  it("merges a second submission with the same number, however it was typed", async () => {
    const first = await upsertContact(base);
    expect(first.created).toBe(true);

    // Same human, different formatting on the form.
    const second = await upsertContact({
      ...base,
      phoneE164: normalizePhone("(941) 555-1234"),
      email: "different@example.com",
    });

    expect(second.created).toBe(false);
    expect(second.contact.id).toBe(first.contact.id);
    expect(fake.contacts).toHaveLength(1);
  });

  it("treats a genuinely different number as a new lead", async () => {
    await upsertContact(base);
    const other = await upsertContact({ ...base, phoneE164: "+19415559876", email: "bob@example.com" });
    expect(other.created).toBe(true);
    expect(fake.contacts).toHaveLength(2);
  });
});

describe("dedupe by email", () => {
  it("merges on email when no phone was given", async () => {
    const first = await upsertContact({ ...base, phoneE164: null });
    const second = await upsertContact({ ...base, phoneE164: null, name: "Jane D" });
    expect(second.created).toBe(false);
    expect(second.contact.id).toBe(first.contact.id);
    expect(fake.contacts).toHaveLength(1);
  });

  it("ignores case differences in the email", async () => {
    const first = await upsertContact({ ...base, phoneE164: null });
    const second = await upsertContact({
      ...base,
      phoneE164: null,
      email: normalizeEmail("  JANE@EXAMPLE.COM "),
    });
    expect(second.contact.id).toBe(first.contact.id);
    expect(fake.contacts).toHaveLength(1);
  });

  it("prefers the phone match when phone and email point at different rows", async () => {
    // Phone is the stronger identity signal and is checked first.
    const byPhone = await upsertContact({ ...base, email: null });
    await upsertContact({ ...base, phoneE164: null, email: "someone-else@example.com" });

    const found = await findContact("+19415551234", "someone-else@example.com");
    expect(found?.id).toBe(byPhone.contact.id);
  });
});

describe("merge semantics", () => {
  it("fills a missing field without erasing one already known", async () => {
    const first = await upsertContact({ ...base, company: "Bayside Dental" });
    const merged = await upsertContact({ ...base, company: null, role: "Office Manager" });

    expect(merged.contact.id).toBe(first.contact.id);
    // A later submission that omitted the company must not blank it.
    expect(merged.contact.company).toBe("Bayside Dental");
    expect(merged.contact.role).toBe("Office Manager");
  });

  it("backfills a phone number onto a lead that first arrived with only an email", async () => {
    const first = await upsertContact({ ...base, phoneE164: null });
    const merged = await upsertContact(base);
    expect(merged.contact.id).toBe(first.contact.id);
    expect(merged.contact.phone_e164).toBe("+19415551234");
  });

  it("records consent the first time it is given, with its wording and time", async () => {
    await upsertContact(base);
    const merged = await upsertContact({
      ...base,
      consentSms: true,
      consentText: "I agree to receive text messages...",
      consentIp: "203.0.113.7",
    });

    expect(merged.contact.consent_sms).toBe(true);
    expect(merged.contact.consent_text).toBe("I agree to receive text messages...");
    expect(merged.contact.consent_ip).toBe("203.0.113.7");
    expect(merged.contact.consent_at).toBe("2026-10-22T00:00:00Z");
  });

  it("does not let a later submission silently revoke consent", async () => {
    await upsertContact({ ...base, consentSms: true, consentText: "original wording" });
    const merged = await upsertContact({ ...base, consentSms: false });

    // Revoking is an explicit act (STOP), not the absence of a tick.
    expect(merged.contact.consent_sms).toBe(true);
    expect(merged.contact.consent_text).toBe("original wording");
  });

  it("keeps the original consent record when consent is given again later", async () => {
    await upsertContact({ ...base, consentSms: true, consentText: "original wording", consentIp: "203.0.113.7" });
    const merged = await upsertContact({ ...base, consentSms: true, consentText: "reworded later", consentIp: "198.51.100.2" });

    // What they agreed to is what they were shown the first time.
    expect(merged.contact.consent_text).toBe("original wording");
    expect(merged.contact.consent_ip).toBe("203.0.113.7");
    expect(merged.contact.consent_at).toBe("2026-10-21T00:00:00Z");
  });
});

describe("findContact", () => {
  it("returns null when neither key matches", async () => {
    await upsertContact(base);
    expect(await findContact("+19998887777", "nobody@example.com")).toBeNull();
  });

  it("does not match on a null key", async () => {
    await upsertContact({ ...base, email: null });
    expect(await findContact(null, null)).toBeNull();
  });
});
