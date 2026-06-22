type Props = {
  imageKey: string;
  name: string;
  className?: string;
};

// Refined black & white research-vial illustrations with a clinical accent.
function Vial({ tall = false }: { tall?: boolean }) {
  const bodyTop = 78;
  const bodyH = tall ? 96 : 80;
  const bottom = bodyTop + bodyH;
  return (
    <g>
      {/* cap */}
      <rect x="84" y="52" width="32" height="14" rx="3" className="fill-accent" />
      {/* neck */}
      <rect x="88" y="66" width="24" height="12" className="fill-ink" />
      {/* glass body */}
      <path
        d={`M82 ${bodyTop} h36 v${bodyH - 16} a18 18 0 0 1 -18 18 a18 18 0 0 1 -18 -18 z`}
        className="fill-paper stroke-ink"
        strokeWidth="3"
      />
      {/* contents (lyophilized) */}
      <path
        d={`M82 ${bottom - 44} h36 v${28} a18 18 0 0 1 -18 18 a18 18 0 0 1 -18 -18 z`}
        className="fill-ink"
      />
      {/* meniscus accent line */}
      <line x1="82" y1={bottom - 44} x2="118" y2={bottom - 44} className="stroke-accent" strokeWidth="2" />
    </g>
  );
}

const SHAPES: Record<string, JSX.Element> = {
  vial: <Vial />,
  solvent: <Vial tall />,
  default: <Vial />,
};

export default function ProductImage({ imageKey, name, className }: Props) {
  const shape = SHAPES[imageKey] ?? SHAPES.default;
  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label={name}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <rect width="200" height="220" className="fill-paper-muted" />
      {shape}
    </svg>
  );
}
