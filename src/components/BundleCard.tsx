import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/format";

export type BundleCardData = {
  slug: string;
  name: string;
  imageKey: string;
  discountPercent: number;
  normalTotal: number;
  bundlePrice: number;
  itemCount: number;
};

export default function BundleCard({ bundle }: { bundle: BundleCardData }) {
  return (
    <Link href={`/bundle/${bundle.slug}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden border border-line">
        <ProductImage
          imageKey={bundle.imageKey}
          name={bundle.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="badge absolute left-3 top-3 bg-ink text-paper">
          Save {bundle.discountPercent}%
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold group-hover:underline">{bundle.name}</h3>
      <p className="text-xs text-ink-muted">{bundle.itemCount} products</p>
      <div className="mt-1 flex items-baseline gap-2 text-sm">
        <span className="font-semibold">{formatPrice(bundle.bundlePrice)}</span>
        <span className="text-xs text-ink-muted line-through">{formatPrice(bundle.normalTotal)}</span>
      </div>
    </Link>
  );
}
