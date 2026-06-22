const STYLES: Record<string, string> = {
  PENDING: "border border-line text-ink-muted",
  PAID: "bg-ink text-paper",
  SHIPPED: "bg-ink-soft text-paper",
  DELIVERED: "border border-ink text-ink",
  CANCELLED: "border border-line text-ink-muted line-through",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] ?? STYLES.PENDING}`}>{status}</span>
  );
}
