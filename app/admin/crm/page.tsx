import Link from "next/link";
import { isDbConfigured } from "@/lib/db/client";
import {
  pipelineByStage,
  countsBySyncState,
  listRecentContacts,
  type PipelineStage,
} from "@/lib/db/queries";
import { getA2pStatus } from "@/lib/quo/a2p";
import { isQuoConfigured } from "@/lib/quo/client";
import { fmtDateTime, fmtSource } from "@/lib/admin/format";
import SetupNotice from "@/app/admin/crm/SetupNotice";

export const dynamic = "force-dynamic";

/** Stage order for display. Anything unrecognised is appended. */
const STAGE_ORDER = ["new", "qualified", "proposal", "won", "lost"];

export default async function CrmDashboard() {
  if (!isDbConfigured()) return <SetupNotice />;

  const [stages, syncCounts, recent, a2pStatus] = await Promise.all([
    pipelineByStage(),
    countsBySyncState(),
    listRecentContacts(8),
    isQuoConfigured() ? getA2pStatus() : Promise.resolve("unknown" as const),
  ]);

  const failed = syncCounts.find((s) => s.quo_sync === "failed")?.n ?? 0;
  const smsEnabled = process.env.SMS_CONFIRMATIONS_ENABLED === "true";

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-ink mb-6">Pipeline</h1>
        {stages.length === 0 ? (
          <p className="text-faded text-sm">
            No deals yet. Leads arrive in the{" "}
            <Link href="/admin/crm/leads" className="text-accent hover:underline">
              lead inbox
            </Link>{" "}
            first.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sortStages(stages).map((s) => (
              <div key={s.stage} className="border border-line rounded-xl p-4">
                <p className="text-faded text-xs uppercase tracking-wide mb-1">{s.stage}</p>
                <p className="text-2xl font-bold text-ink">{s.deal_count}</p>
                {s.monthly_total && (
                  <p className="text-faded text-xs mt-1">
                    ${Number(s.monthly_total).toLocaleString("en-US")}/mo
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-4">Integration status</h2>
        <dl className="grid gap-4 sm:grid-cols-3 text-sm">
          <StatusCard
            label="SMS confirmations"
            value={smsEnabled ? "Flag on" : "Flag off"}
            detail={
              smsEnabled
                ? "Sends only to leads who consented, and only once 10DLC is approved."
                : "SMS_CONFIRMATIONS_ENABLED is not set to true. Nothing is sent."
            }
          />
          <StatusCard
            label="A2P 10DLC"
            value={a2pLabel(a2pStatus)}
            detail={
              a2pStatus === "approved"
                ? "Carriers have approved the campaign."
                : "Texting stays blocked until this reads approved."
            }
          />
          <StatusCard
            label="Quo sync"
            value={failed === 0 ? "Healthy" : `${failed} failed`}
            detail={
              failed === 0
                ? "Every lead has been mirrored to Quo."
                : "The daily reconciliation job retries these."
            }
          />
        </dl>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Newest leads</h2>
          <Link href="/admin/crm/leads" className="text-accent text-sm hover:underline">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-faded text-sm">No leads yet.</p>
        ) : (
          <ul className="divide-y divide-line border border-line rounded-xl">
            {recent.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center gap-4">
                <Link
                  href={`/admin/crm/contacts/${c.id}`}
                  className="text-ink font-medium hover:text-accent transition-colors"
                >
                  {c.name || c.phone_e164 || c.email || `Lead ${c.id}`}
                </Link>
                <span className="text-faded text-xs">{fmtSource(c.source)}</span>
                <span className="text-faded text-xs ml-auto">{fmtDateTime(c.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function sortStages(stages: PipelineStage[]): PipelineStage[] {
  return [...stages].sort((a, b) => {
    const ai = STAGE_ORDER.indexOf(a.stage);
    const bi = STAGE_ORDER.indexOf(b.stage);
    return (ai === -1 ? STAGE_ORDER.length : ai) - (bi === -1 ? STAGE_ORDER.length : bi);
  });
}

function a2pLabel(status: string): string {
  const labels: Record<string, string> = {
    approved: "Approved",
    pending: "Awaiting carriers",
    rejected: "Rejected",
    failed: "Failed",
    none: "Not submitted",
    unknown: "Unknown",
  };
  return labels[status] ?? status;
}

function StatusCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border border-line rounded-xl p-4">
      <dt className="text-faded text-xs uppercase tracking-wide mb-1">{label}</dt>
      <dd className="text-ink font-semibold mb-1">{value}</dd>
      <dd className="text-faded text-xs leading-relaxed">{detail}</dd>
    </div>
  );
}
