import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container-site py-16">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Get in Touch</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-4 max-w-md text-ink-muted">
            Questions about a product, an order, or wholesale? Send us a note and
            our team will get back to you within one business day.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Email
              </dt>
              <dd className="mt-1">
                <a href="mailto:support@axevia.co" className="underline-offset-2 hover:underline">
                  support@axevia.co
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Phone
              </dt>
              <dd className="mt-1">+1 (800) 555-0199</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Hours
              </dt>
              <dd className="mt-1">Mon–Fri, 9am–6pm CT</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
