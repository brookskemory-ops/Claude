"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "axevia_cookie_consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== "1") setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!show) return null;

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur">
      <div className="container-site flex flex-col items-center justify-between gap-3 py-3 text-xs text-ink-muted sm:flex-row">
        <p>
          We use essential cookies for sign-in and your cart. See our{" "}
          <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
        </p>
        <button onClick={accept} className="btn-primary btn-sm shrink-0">
          Accept
        </button>
      </div>
    </div>
  );
}
