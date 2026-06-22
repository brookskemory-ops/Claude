export type CartItem = {
  slug: string;
  name: string;
  imageKey: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
};

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

export const CATEGORIES = [
  "Protein",
  "Pre-Workout",
  "Creatine",
  "Vitamins",
  "Recovery",
  "Greens",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
