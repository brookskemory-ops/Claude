type Props = {
  imageKey: string;
  name: string;
  className?: string;
};

// Brand-styled black & white SVG placeholders for research-peptide products.
// Swapping in real product/COA photography later means replacing this component's output.
const SHAPES: Record<string, JSX.Element> = {
  vial: (
    <g>
      <rect x="86" y="58" width="28" height="10" rx="2" />
      <rect x="84" y="68" width="32" height="8" rx="1" />
      <path d="M86 76 h28 v74 a14 14 0 0 1 -14 14 a14 14 0 0 1 -14 -14 z" />
      <rect x="86" y="120" width="28" height="30" className="fill-paper" />
    </g>
  ),
  solvent: (
    <g>
      <rect x="92" y="54" width="16" height="14" rx="2" />
      <rect x="84" y="68" width="32" height="12" rx="2" />
      <path d="M82 80 h36 v62 a10 10 0 0 1 -10 10 h-16 a10 10 0 0 1 -10 -10 z" />
      <rect x="82" y="120" width="36" height="22" className="fill-paper" />
    </g>
  ),
  default: (
    <g>
      <rect x="86" y="58" width="28" height="10" rx="2" />
      <rect x="84" y="68" width="32" height="8" rx="1" />
      <path d="M86 76 h28 v74 a14 14 0 0 1 -14 14 a14 14 0 0 1 -14 -14 z" />
      <rect x="86" y="118" width="28" height="32" className="fill-paper" />
    </g>
  ),
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
      <g className="fill-ink">{shape}</g>
    </svg>
  );
}
