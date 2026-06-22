// Recreated Axevia brand marks as inline SVG/text so they stay crisp at any size and
// adapt to light/dark backgrounds. Drop original files into /public to override later.

export function LogoMonogram({
  size = 40,
  invert = false,
  className = "",
}: {
  size?: number;
  invert?: boolean;
  className?: string;
}) {
  const square = invert ? "fill-paper" : "fill-ink";
  const letter = invert ? "fill-ink" : "fill-paper";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Axevia"
      className={className}
    >
      <rect width="100" height="100" rx="24" className={square} />
      <text
        x="46"
        y="72"
        textAnchor="middle"
        className={letter}
        style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "62px" }}
      >
        A
      </text>
      <circle cx="74" cy="68" r="8" className={letter} />
    </svg>
  );
}

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline leading-none ${className}`}
      aria-label="axevia"
    >
      <span className="font-light">[</span>
      <span className="px-[0.18em] font-bold lowercase tracking-tight">axevia</span>
      <span className="font-light">]</span>
      <span className="ml-[0.1em] self-end pb-[0.15em] text-[0.5em] font-normal">n</span>
    </span>
  );
}

export function LogoLockup({
  invert = false,
  tagline = true,
  className = "",
}: {
  invert?: boolean;
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMonogram size={44} invert={invert} />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-bold lowercase tracking-tight">axevia</span>
        {tagline && (
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] opacity-70">
            Research Grade Peptides
          </span>
        )}
      </span>
    </span>
  );
}
