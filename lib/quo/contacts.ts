import { quoFetch } from "@/lib/quo/client";

/**
 * Contact mirroring into Quo.
 *
 * Dedupe constraint worth knowing: GET /contacts cannot be filtered by phone
 * number or email. The only filters are externalId and source. So we set
 * externalId to our own canonical key (the E.164 phone, or "email:<address>"
 * when there is no phone) and look the contact up by that. One request,
 * exact match, no scanning the whole workspace.
 *
 * The dated API also has no inline phone/email fields on create: those are
 * typed contact properties, added in follow-up requests.
 */

/** Marks every contact this site creates, so they are distinguishable in Quo. */
export const QUO_SOURCE = "redrose-site";

export type QuoContact = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  role?: string | null;
  externalId?: string | null;
  source?: string | null;
};

type ListResponse = { data?: QuoContact[] };
type SingleResponse = { data?: QuoContact };

/**
 * Our stable key for a Quo contact. Phone wins because it is how calls and
 * texts arrive; email is the fallback for a lead that gave no number.
 */
export function externalIdFor(phoneE164: string | null, email: string | null): string | null {
  if (phoneE164) return phoneE164;
  if (email) return `email:${email}`;
  return null;
}

export async function findContactByExternalId(externalId: string): Promise<QuoContact | null> {
  const res = await quoFetch<ListResponse>("/contacts", {
    query: { externalId, limit: 1 },
  });
  return res?.data?.[0] ?? null;
}

export type UpsertContactInput = {
  externalId: string;
  firstName: string;
  lastName?: string | null;
  company?: string | null;
  role?: string | null;
  phoneE164?: string | null;
  email?: string | null;
  sourceUrl?: string | null;
  /** Free-text note body holding the structured lead detail. */
  note?: string | null;
};

export type UpsertContactResult = {
  contactId: string;
  created: boolean;
};

/**
 * Create or update the Quo contact for a lead, then attach a note.
 *
 * Properties are only written on create. Re-writing them on every repeat
 * submission would stack duplicate phone/email rows on the contact, since
 * POST /properties appends rather than replacing.
 */
export async function upsertQuoContact(
  input: UpsertContactInput
): Promise<UpsertContactResult> {
  const existing = await findContactByExternalId(input.externalId);

  if (existing) {
    // PATCH, not PUT: the dated API's PATCH is a merge, so omitted fields
    // keep their stored values. Only send what we actually learned.
    const patch = pruneUndefined({
      firstName: input.firstName || undefined,
      lastName: input.lastName ?? undefined,
      company: input.company ?? undefined,
      role: input.role ?? undefined,
    });
    if (Object.keys(patch).length > 0) {
      await quoFetch<SingleResponse>(`/contacts/${encodeURIComponent(existing.id)}`, {
        method: "PATCH",
        body: patch,
      });
    }
    if (input.note) await addContactNote(existing.id, input.note);
    return { contactId: existing.id, created: false };
  }

  const created = await quoFetch<SingleResponse>("/contacts", {
    method: "POST",
    body: pruneUndefined({
      firstName: input.firstName,
      lastName: input.lastName ?? undefined,
      company: input.company ?? undefined,
      role: input.role ?? undefined,
      externalId: input.externalId,
      source: QUO_SOURCE,
      sourceUrl: input.sourceUrl ?? undefined,
    }),
  });

  const contactId = created?.data?.id;
  if (!contactId) {
    throw new Error("Quo contact creation returned no id");
  }

  if (input.phoneE164) {
    await addContactProperty(contactId, "phone-number", "Mobile", input.phoneE164);
  }
  if (input.email) {
    await addContactProperty(contactId, "email", "Email", input.email);
  }
  if (input.note) {
    await addContactNote(contactId, input.note);
  }

  return { contactId, created: true };
}

async function addContactProperty(
  contactId: string,
  type: string,
  name: string,
  value: string
): Promise<void> {
  await quoFetch(`/contacts/${encodeURIComponent(contactId)}/properties`, {
    method: "POST",
    body: { type, name, value },
  });
}

/**
 * Append a note.
 *
 * Quo resolves @US.../@GR.../@OR... in note text as mentions, so a lead whose
 * message happens to contain that pattern could tag a real user. Neutralise
 * the "@" before it reaches Quo.
 */
export async function addContactNote(contactId: string, body: string): Promise<void> {
  await quoFetch(`/contacts/${encodeURIComponent(contactId)}/notes`, {
    method: "POST",
    body: { body: escapeMentions(body).slice(0, 5000) },
  });
}

export function escapeMentions(text: string): string {
  return text.replace(/@(US|GR|OR)([A-Za-z0-9]+)/g, "[at]$1$2");
}

function pruneUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as Partial<T>;
}
