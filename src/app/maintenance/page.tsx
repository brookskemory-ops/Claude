import type { Metadata } from "next";
import { LogoMonogram } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Launching Soon",
  robots: { index: false, follow: false },
};

export default function MaintenancePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <LogoMonogram size={72} invert />
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-paper/60">
        Axevia · Research Grade Peptides
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Launching soon.</h1>
      <p className="mt-4 max-w-md text-paper/70">
        Our research-peptide catalog is almost ready. Authorized researchers with an access code
        can enter below.
      </p>

      <form
        action="/api/preview"
        method="post"
        className="mt-8 flex w-full max-w-sm gap-2"
      >
        <input
          name="code"
          type="password"
          placeholder="Access code"
          className="w-full border border-paper/30 bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-paper focus:outline-none"
          required
        />
        <button
          type="submit"
          className="shrink-0 bg-paper px-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink hover:bg-paper/90"
        >
          Enter
        </button>
      </form>
      {searchParams.error && (
        <p className="mt-3 text-xs text-paper/60">Incorrect access code.</p>
      )}

      <p className="mt-10 text-[11px] uppercase tracking-[0.18em] text-paper/40">
        Research Use Only — not for human or veterinary use
      </p>
    </div>
  );
}
