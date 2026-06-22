"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Captures ?ref=CODE from a referral link into a cookie that registration reads.
export default function ReferralCapture() {
  const params = useSearchParams();
  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      document.cookie = `axevia_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 90}`;
    }
  }, [params]);
  return null;
}
