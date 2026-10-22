import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";

/**
 * The admin area sits outside the localised marketing site: its own root
 * layout, no translations, no marketing chrome.
 */
export const metadata: Metadata = {
  title: "Red Rose CRM",
  // Belt and braces alongside the middleware gate: even if a URL leaks, it
  // should never end up in an index.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-base text-ink min-h-screen antialiased">
        <header className="border-b border-line">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
            <Link href="/admin/crm" className="font-bold text-ink">
              Red Rose CRM
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/admin/crm" className="text-faded hover:text-ink transition-colors">
                Pipeline
              </Link>
              <Link href="/admin/crm/leads" className="text-faded hover:text-ink transition-colors">
                Lead inbox
              </Link>
            </nav>
            <form action="/api/admin/logout" method="post" className="ml-auto">
              <button type="submit" className="text-faded hover:text-ink text-sm transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
