// Client-side GA4 event helper. No-op when GA isn't loaded.
export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", name, params);
  }
}
