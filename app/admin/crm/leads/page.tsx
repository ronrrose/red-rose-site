import Link from "next/link";
import { isDbConfigured } from "@/lib/db/client";
import { listRecentContacts } from "@/lib/db/queries";
import { fmtDateTime, fmtPhone, fmtSource } from "@/lib/admin/format";
import SetupNotice from "@/app/admin/crm/SetupNotice";

export const dynamic = "force-dynamic";

/** Lead inbox, newest first. */
export default async function LeadInbox() {
  if (!isDbConfigured()) return <SetupNotice />;

  const contacts = await listRecentContacts(200);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Lead inbox</h1>

      {contacts.length === 0 ? (
        <p className="text-faded text-sm">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto border border-line rounded-xl">
          <table className="w-full text-sm">
            <thead className="text-faded text-xs uppercase tracking-wide">
              <tr className="border-b border-line">
                <th className="text-left font-medium px-4 py-3">Name</th>
                <th className="text-left font-medium px-4 py-3">Phone</th>
                <th className="text-left font-medium px-4 py-3">Email</th>
                <th className="text-left font-medium px-4 py-3">Source</th>
                <th className="text-left font-medium px-4 py-3">SMS</th>
                <th className="text-left font-medium px-4 py-3">Quo</th>
                <th className="text-left font-medium px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contacts.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/crm/contacts/${c.id}`}
                      className="text-ink font-medium hover:text-accent transition-colors"
                    >
                      {c.name || `Lead ${c.id}`}
                    </Link>
                    {c.do_not_contact && (
                      <span className="ml-2 text-xs text-red-500">opted out</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-faded">{fmtPhone(c.phone_e164)}</td>
                  <td className="px-4 py-3 text-faded">{c.email || "-"}</td>
                  <td className="px-4 py-3 text-faded">{fmtSource(c.source)}</td>
                  <td className="px-4 py-3 text-faded">{c.consent_sms ? "Consented" : "No"}</td>
                  <td className="px-4 py-3">
                    <SyncBadge state={c.quo_sync} />
                  </td>
                  <td className="px-4 py-3 text-faded whitespace-nowrap">
                    {fmtDateTime(c.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SyncBadge({ state }: { state: string }) {
  if (state === "ok") return <span className="text-faded text-xs">Synced</span>;
  if (state === "failed") return <span className="text-red-500 text-xs">Failed</span>;
  return <span className="text-faded text-xs">Pending</span>;
}
