import { db } from "@/lib/db";
import { updateMaintenance } from "../actions";

export default async function AdminSettings() {
  const config = await db.siteConfig.findUnique({ where: { id: "singleton" } });
  const on = config?.maintenanceMode ?? false;
  const code = config?.maintenanceCode ?? "";
  const promoText = config?.promoText ?? "";
  const launchPct = config?.launchDiscountPercent ?? 0;

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

        <div className="border-t border-line pt-5">
          <label className="label">Promo banner text (leave blank to hide the banner)</label>
          <input
            name="promoText"
            className="input"
            defaultValue={promoText}
            placeholder="e.g. Launch offer — 20% off, applied automatically at checkout"
          />
        </div>

        <div>
          <label className="label">Launch discount % (0 = off; applied automatically at checkout)</label>
          <input
            name="launchDiscountPercent"
            type="number"
            min="0"
            max="90"
            className="input w-32"
            defaultValue={launchPct}
          />
          <p className="mt-1 text-xs text-ink-muted">
            Currently{" "}
            <span className={launchPct > 0 ? "font-semibold text-ink" : ""}>
              {launchPct > 0 ? `${launchPct}% off all orders` : "off"}
            </span>
            . Stacks with volume and coupon discounts.
          </p>
        </div>

        <button className="btn-primary">Save Settings</button>
      </form>
    </div>
  );
}
