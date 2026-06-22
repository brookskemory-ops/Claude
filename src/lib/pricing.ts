export type SalePricing = {
  price: number;
  salePrice: number | null;
  saleEndsAt: Date | string | null;
};

/** Returns true when a product's sale is currently active. */
export function isOnSale(product: SalePricing): boolean {
  if (product.salePrice == null) return false;
  if (product.salePrice >= product.price) return false;
  if (product.saleEndsAt) {
    const ends = new Date(product.saleEndsAt);
    if (ends.getTime() < Date.now()) return false;
  }
  return true;
}

/** The price a customer actually pays (sale price when a sale is active). */
export function effectivePrice(product: SalePricing): number {
  return isOnSale(product) ? (product.salePrice as number) : product.price;
}

/** Whole-number percentage off, e.g. 25 for 25% off. Null when not on sale. */
export function discountPercent(product: SalePricing): number | null {
  if (!isOnSale(product)) return null;
  const off = (1 - (product.salePrice as number) / product.price) * 100;
  return Math.round(off);
}

export type Coupon = {
  code: string;
  percentOff: number | null;
  amountOff: number | null;
  active: boolean;
  expiresAt: Date | string | null;
};

export function isCouponValid(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return false;
  }
  return true;
}

/** Discount amount a coupon applies to a given subtotal (never below zero). */
export function couponDiscount(coupon: Coupon, subtotal: number): number {
  if (!isCouponValid(coupon)) return 0;
  let discount = 0;
  if (coupon.percentOff) discount += (subtotal * coupon.percentOff) / 100;
  if (coupon.amountOff) discount += coupon.amountOff;
  return Math.min(Math.round(discount * 100) / 100, subtotal);
}

export const FREE_SHIPPING_THRESHOLD = 75;
export const FLAT_SHIPPING = 6.95;
export const TAX_RATE = 0.07;

export function shippingFor(subtotalAfterDiscount: number): number {
  if (subtotalAfterDiscount <= 0) return 0;
  return subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Lowest effective (sale-aware) price across a product's variants. */
export function minEffectivePrice(variants: SalePricing[]): number {
  if (!variants.length) return 0;
  return Math.min(...variants.map(effectivePrice));
}

export function anyOnSale(variants: SalePricing[]): boolean {
  return variants.some(isOnSale);
}

export function totalStock(variants: { stock: number }[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}
