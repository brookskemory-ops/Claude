import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "FAQ" };

const FAQS: { q: string; a: string }[] = [
  {
    q: "Are Axevia products safe for human use?",
    a: "No. All products are sold strictly for laboratory and in-vitro research use only. They are not for human or veterinary consumption and are not drugs, foods, or medical devices.",
  },
  {
    q: "Do you provide a Certificate of Analysis (COA)?",
    a: "Yes. Each product lists its purity, and a Certificate of Analysis is available for every lot — linked on the product page and your order confirmation.",
  },
  {
    q: "How are products tested?",
    a: "Compounds are analyzed by independent laboratories using HPLC and mass spectrometry to confirm identity and purity (typically ≥99%).",
  },
  {
    q: "How should I store the peptides?",
    a: "Unless otherwise noted, store lyophilized product at -20°C and protected from light. Specific guidance is on each product page.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Card payments are processed securely through our payment provider. Available methods appear at checkout.",
  },
  {
    q: "How long does shipping take and can I track it?",
    a: "Orders typically ship within 1–2 business days. You'll get a tracking number by email, and you can follow real-time status under My Account → Track Shipments.",
  },
  {
    q: "What is your return policy?",
    a: "Unopened items in original condition may be returned within the window described in our Refund & Return Policy. Opened items are non-returnable for safety reasons.",
  },
  {
    q: "Do you offer institutional or tax-exempt purchasing?",
    a: "Yes. Upload your resale/exemption certificate from your account and we'll review it; approved accounts are charged no sales tax.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Support</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>

      <div className="mt-6">
        <Link href="/contact" className="btn-primary">
          Still have a question? Contact us
        </Link>
      </div>

      <div className="mt-10 divide-y divide-line border-y border-line">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              {f.q}
              <span className="text-ink-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
