import { db } from "@/lib/db";
import { updateMaintenance } from "../actions";

export default async function AdminSettings() {
  const config = await db.siteConfig.findUnique({ where: { id: "singleton" } });
  const on = config?.maintenanceMode ?? false;
  const code = config?.maintenanceCode ?? "";

  return (
    <div className="max-w-xl">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]">Site Settings</h2>
      <p className="mb-6 text-sm text-ink-muted">
        Turn on maintenance mode to show a coming-soon page to the public. You (admins) and anyone
        with the access code can still browse the live site. Takes effect immediately — no redeploy
        needed.
      </p>

      <form action={updateMaintenance} className="space-y-5 border border-line p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Maintenance mode</p>
            <p className="text-xs text-ink-muted">
              Currently{" "}
              <span className={on ? "font-semibold text-ink" : ""}>{on ? "ON" : "OFF"}</span>.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="maintenanceMode" defaultChecked={on} />
            Enabled
          </label>
        </div>

        <div>
          <label className="label">Access code (lets team/testers bypass the gate)</label>
          <input
            name="maintenanceCode"
            className="input"
            defaultValue={code}
            placeholder="e.g. axevia-team-2026"
          />
          <p className="mt-1 text-xs text-ink-muted">
            Share this code; entering it at the coming-soon page grants access for 30 days.
          </p>
        </div>

        <button className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
