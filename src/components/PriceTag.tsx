import { formatPrice } from "@/lib/format";
import { effectivePrice, isOnSale, type SalePricing } from "@/lib/pricing";

export default function PriceTag({
  product,
  className = "",
  size = "md",
}: {
  product: SalePricing;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const onSale = isOnSale(product);
  const price = effectivePrice(product);
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-semibold ${sizes[size]}`}>{formatPrice(price)}</span>
      {onSale && (
        <span className={`text-ink-muted line-through ${size === "lg" ? "text-base" : "text-xs"}`}>
          {formatPrice(product.price)}
        </span>
      )}
    </span>
  );
}
