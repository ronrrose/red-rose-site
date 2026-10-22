import { formatPhoneForDisplay } from "@/lib/phone";

/** Shared display helpers for the admin views. */

export function fmtDateTime(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtPhone(value: string | null): string {
  if (!value) return "-";
  return formatPhoneForDisplay(value);
}

export function fmtDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export function fmtSource(source: string): string {
  const labels: Record<string, string> = {
    website_form: "Website form",
    chat: "AI chat",
    quo_inbound: "Call or text",
    quo_reconcile: "Backfill",
  };
  return labels[source] ?? source;
}

export function fmtActivityType(type: string): string {
  const labels: Record<string, string> = {
    call: "Call",
    text: "Text",
    email: "Email",
    form: "Form",
    chat: "Chat",
    note: "Note",
    task: "Task",
  };
  return labels[type] ?? type;
}
