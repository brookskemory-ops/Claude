"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { getReorderItems } from "@/app/account/reorderActions";

export default function ReorderButton({
  orderId,
  className,
}: {
  orderId: string;
  className?: string;
}) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function reorder() {
    setLoading(true);
    setMsg(null);
    const res = await getReorderItems(orderId);
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    for (const it of res.items) {
      const { quantity, ...rest } = it;
      addItem(rest, quantity);
    }
    setMsg("Added to cart.");
  }

  return (
    <div>
      <button
        onClick={reorder}
        disabled={loading}
        className={className ?? "btn-outline btn-sm"}
      >
        {loading ? "Adding…" : "Reorder"}
      </button>
      {msg && <p className="mt-1 text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}
