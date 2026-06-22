type Props = {
  imageKey: string;
  name: string;
  className?: string;
};

// Brand-styled black & white SVG placeholders, one silhouette per category key.
// Swapping in real product photos later only means replacing this component's output.
const SHAPES: Record<string, JSX.Element> = {
  protein: (
    <g>
      <rect x="78" y="70" width="44" height="22" rx="4" />
      <rect x="70" y="92" width="60" height="92" rx="8" />
      <rect x="70" y="120" width="60" height="30" className="opacity-100" />
    </g>
  ),
  preworkout: (
    <g>
      <rect x="74" y="64" width="52" height="14" rx="3" />
      <path d="M72 84 h56 l-6 100 h-44 z" />
      <rect x="72" y="120" width="56" height="26" />
    </g>
  ),
  creatine: (
    <g>
      <rect x="76" y="70" width="48" height="18" rx="4" />
      <rect x="68" y="88" width="64" height="96" rx="6" />
      <circle cx="100" cy="134" r="20" className="fill-paper" />
    </g>
  ),
  vitamins: (
    <g>
      <rect x="78" y="66" width="44" height="20" rx="6" />
      <rect x="72" y="86" width="56" height="98" rx="10" />
      <rect x="84" y="112" width="32" height="44" className="fill-paper" />
    </g>
  ),
  recovery: (
    <g>
      <rect x="80" y="62" width="40" height="16" rx="3" />
      <rect x="70" y="78" width="60" height="106" rx="8" />
      <path d="M70 130 h60 v10 h-60 z" className="fill-paper" />
    </g>
  ),
  greens: (
    <g>
      <rect x="78" y="68" width="44" height="20" rx="5" />
      <rect x="70" y="88" width="60" height="96" rx="8" />
      <path
        d="M100 110 q-18 6 -18 26 q18 -4 18 -26 q0 22 18 26 q0 -20 -18 -26z"
        className="fill-paper"
      />
    </g>
  ),
  default: (
    <g>
      <rect x="76" y="70" width="48" height="20" rx="4" />
      <rect x="70" y="90" width="60" height="94" rx="8" />
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
