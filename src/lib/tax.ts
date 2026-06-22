import "server-only";
import { db } from "@/lib/db";
import { round2 } from "@/lib/pricing";

/** Sales-tax percent configured for a state (0 when none — i.e. no nexus). */
export async function taxPercentForState(state: string): Promise<number> {
  if (!state) return 0;
  const rate = await db.taxRate.findUnique({
    where: { state: state.trim().toUpperCase() },
  });
  return rate?.percent ?? 0;
}

/** Tax amount for a taxable subtotal shipped to a state; 0 if exempt or no rate. */
export async function computeTax(
  state: string,
  taxable: number,
  exempt = false,
): Promise<number> {
  if (exempt || taxable <= 0) return 0;
  const percent = await taxPercentForState(state);
  return round2((taxable * percent) / 100);
}
