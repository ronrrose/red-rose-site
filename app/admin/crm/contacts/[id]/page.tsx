import Link from "next/link";
import { notFound } from "next/navigation";
import { isDbConfigured } from "@/lib/db/client";
import { getContact, listActivitiesForContact } from "@/lib/db/queries";
import {
  fmtDateTime,
  fmtPhone,
  fmtSource,
  fmtDuration,
  fmtActivityType,
} from "@/lib/admin/format";
import SetupNotice from "@/app/admin/crm/SetupNotice";

export const dynamic = "force-dynamic";

export default async function ContactPage({ params }: { params: { id: string } }) {
  if (!isDbConfigured()) return <SetupNotice />;

  // Ids are bigserial. Reject anything else before it reaches the query.
  if (!/^\d+$/.test(params.id)) notFound();

  const contact = await getContact(params.id);
  if (!contact) notFound();

  const activities = await listActivitiesForContact(contact.id);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/crm/leads" className="text-accent text-sm hover:underline">
          Back to lead inbox
        </Link>
        <h1 className="text-2xl font-bold text-ink mt-3">
          {contact.name || `Lead ${contact.id}`}
        </h1>
        {contact.do_not_contact && (
          <p className="text-red-500 text-sm mt-1">
            Opted out of text messages. Do not text this number.
          </p>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <Field label="Phone" value={fmtPhone(contact.phone_e164)} />
        <Field label="Email" value={contact.email || "-"} />
        <Field label="Company" value={contact.company || "-"} />
        <Field label="Role" value={contact.role || "-"} />
        <Field label="Source" value={fmtSource(contact.source)} />
        <Field label="Status" value={contact.status} />
        <Field label="First seen" value={fmtDateTime(contact.created_at)} />
        <Field label="Quo sync" value={quoSyncLabel(contact)} />
        <Field
          label="SMS consent"
          value={
            contact.consent_sms
              ? `Yes, ${fmtDateTime(contact.consent_at)}`
              : "No"
          }
        />
      </section>

      {contact.consent_sms && contact.consent_text && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-2">Consent given</h2>
          <blockquote className="border-l-2 border-line pl-4 text-faded text-xs leading-relaxed">
            {contact.consent_text}
            {contact.consent_ip && <span className="block mt-1">From {contact.consent_ip}</span>}
          </blockquote>
        </section>
      )}

      {contact.source_url && (
        <section>
          <h2 className="text-sm font-semibold text-ink mb-2">Landed on</h2>
          <p className="text-faded text-xs break-all">{contact.source_url}</p>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-ink mb-4">Activity timeline</h2>
        {activities.length === 0 ? (
          <p className="text-faded text-sm">Nothing recorded yet.</p>
        ) : (
          <ol className="space-y-4">
            {activities.map((a) => (
              <li key={a.id} className="border-l-2 border-line pl-4">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-ink text-sm font-medium">
                    {fmtActivityType(a.type)}
                  </span>
                  {a.direction && (
                    <span className="text-faded text-xs">{a.direction}</span>
                  )}
                  {a.duration_s !== null && (
                    <span className="text-faded text-xs">{fmtDuration(a.duration_s)}</span>
                  )}
                  <span className="text-faded text-xs ml-auto">
                    {fmtDateTime(a.occurred_at)}
                  </span>
                </div>
                {a.summary && (
                  <p className="text-faded text-sm mt-1 whitespace-pre-wrap">{a.summary}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function quoSyncLabel(contact: { quo_sync: string; quo_sync_error: string | null }): string {
  if (contact.quo_sync === "ok") return "Synced";
  if (contact.quo_sync === "failed") {
    return `Failed: ${contact.quo_sync_error ?? "unknown error"}`;
  }
  return "Pending";
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-xl p-4">
      <p className="text-faded text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-ink break-words">{value}</p>
    </div>
  );
}
