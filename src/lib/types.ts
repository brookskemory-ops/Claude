export type CartItem = {
  variantId: string;
  slug: string; // product slug
  name: string; // product name
  variantLabel: string; // e.g. "10mg"
  sku: string;
  imageKey: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  // Set when this line was added as part of a bundle. unitPrice is the bundle-discounted
  // per-unit price and the volume break is not applied on top of it.
  bundleId?: string;
  bundleName?: string;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

export const CATEGORIES = [
  "Metabolic",
  "Regenerative",
  "Cognitive",
  "Growth Factor",
  "Cosmetic",
  "Blends",
  "Lab Supplies",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
