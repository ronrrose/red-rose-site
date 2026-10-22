/**
 * Shown when DATABASE_URL is missing.
 *
 * The admin pages are the one place in the app where a missing database is
 * worth saying out loud: the operator is the only audience, and a blank
 * screen would be harder to diagnose than this.
 */
export default function SetupNotice() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-ink mb-4">CRM not configured</h1>
      <p className="text-faded text-sm leading-relaxed mb-4">
        DATABASE_URL is not set on this deployment, so there is nothing to read. Create the
        Postgres database, set DATABASE_URL, then apply the schema:
      </p>
      <pre className="bg-raised/50 border border-line rounded-xl p-4 text-xs text-ink overflow-x-auto">
        npm run migrate
      </pre>
    </div>
  );
}
