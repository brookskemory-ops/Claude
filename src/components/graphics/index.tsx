// Scientific / molecular line-art for the Axevia brand. Black & white with a clinical
// accent. All inline SVG, theme-aware via Tailwind fill-/stroke- utility classes.

export function MoleculeLattice({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id="hexlattice" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path
            d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexlattice)" />
    </svg>
  );
}

export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <svg className={className} aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id="dotgrid" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotgrid)" />
    </svg>
  );
}

/** Amino-acid node-and-bond chain. Accent dots punctuate the sequence. */
export function PeptideChain({ className = "" }: { className?: string }) {
  const nodes = [20, 70, 120, 170, 220, 270, 320, 370];
  return (
    <svg className={className} viewBox="0 0 390 90" fill="none" aria-hidden="true">
      <polyline
        points={nodes.map((x, i) => `${x},${i % 2 === 0 ? 34 : 58}`).join(" ")}
        className="stroke-ink"
        strokeWidth="2"
      />
      {nodes.map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={i % 2 === 0 ? 34 : 58}
            r={i % 3 === 0 ? 9 : 6}
            className={i % 3 === 0 ? "fill-accent" : "fill-ink"}
          />
          {/* side group bond */}
          <line
            x1={x}
            y1={i % 2 === 0 ? 34 : 58}
            x2={x}
            y2={i % 2 === 0 ? 14 : 78}
            className="stroke-ink"
            strokeWidth="1.5"
          />
        </g>
      ))}
    </svg>
  );
}

/** Double-helix line motif. */
export function Helix({ className = "" }: { className?: string }) {
  const rungs = Array.from({ length: 9 });
  return (
    <svg className={className} viewBox="0 0 120 320" fill="none" aria-hidden="true">
      <path d="M40 0 C 90 40, -10 80, 40 120 S 90 200, 40 240 S 90 320, 40 320" className="stroke-ink" strokeWidth="2" />
      <path d="M80 0 C 30 40, 130 80, 80 120 S 30 200, 80 240 S 30 320, 80 320" className="stroke-ink" strokeWidth="2" />
      {rungs.map((_, i) => {
        const y = 20 + i * 34;
        return <line key={i} x1="42" y1={y} x2="78" y2={y} className={i % 2 ? "stroke-accent" : "stroke-ink"} strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/** A single hexagon "benzene-ring" accent. */
export function HexRing({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <path d="M30 4 L52 17 L52 43 L30 56 L8 43 L8 17 Z" className="stroke-ink" strokeWidth="2" />
      <circle cx="30" cy="30" r="5" className="fill-accent" />
    </svg>
  );
}

const iconBase = "h-7 w-7";

export function IconPurity({ className = iconBase }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M12 2.5c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9Z" />
      <path d="M9.5 13.5l1.8 1.8 3.2-3.4" className="stroke-accent" strokeWidth="1.8" />
    </svg>
  );
}

export function IconTested({ className = iconBase }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 2.5h6M10 2.5v6L5.5 18a2 2 0 0 0 1.8 2.9h9.4A2 2 0 0 0 18.5 18L14 8.5v-6" />
      <circle cx="12" cy="16" r="1.3" className="fill-accent stroke-accent" />
    </svg>
  );
}

export function IconCOA({ className = iconBase }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 2.5h8l4 4v15H6Z" />
      <path d="M14 2.5v4h4" />
      <path d="M8.5 14.5l1.6 1.6 3.4-3.6" className="stroke-accent" strokeWidth="1.8" />
    </svg>
  );
}

export function IconShipping({ className = iconBase }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7.5 12 3l9 4.5v9L12 21 3 16.5Z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" className="stroke-accent" />
    </svg>
  );
}
