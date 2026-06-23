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
    a: "Orders ship within 1 business day. Domestic shipping is free on orders over $75. You'll get a tracking number by email, and you can follow real-time status under My Account → Track Shipments.",
  },
  {
    q: "What is your return policy?",
    a: "We stand behind every order with a 30-day money-back guarantee. Unopened items in original condition may be returned within 30 days of delivery; opened or reconstituted items are non-returnable for safety reasons. See our Refund & Return Policy for full details.",
  },
  {
    q: "Who is allowed to purchase from Axevia?",
    a: "Axevia sells only to qualified researchers and institutions (21+) for laboratory and in-vitro research use. By placing an order you confirm you meet these criteria and accept our Research-Use Policy.",
  },
  {
    q: "Do you offer volume or bulk discounts?",
    a: "Yes — buy 2 of a product to save 5%, or 3 or more to save 10%. The discount is applied automatically per product in your cart and at checkout.",
  },
  {
    q: "How do loyalty points work?",
    a: "You earn 1 point for every $1 of merchandise on completed orders. Redeem 100 points for $5 off at checkout. Your balance is shown in My Account.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Contact us as soon as possible at support@axevia.co. We can usually adjust or cancel an order before it ships.",
  },
  {
    q: "Who can leave a product review?",
    a: "Only customers who have purchased a product can review it, so every review on the site comes from a verified buyer.",
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
