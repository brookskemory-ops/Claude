"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/gtag";

export default function PurchaseTracking({
  number,
  total,
}: {
  number: string;
  total: number;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track("purchase", { transaction_id: number, currency: "USD", value: total });
  }, [number, total]);
  return null;
}
