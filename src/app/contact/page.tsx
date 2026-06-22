import type { Metadata } from "next";

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

        <form className="space-y-4 border border-line p-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input" rows={5} />
          </div>
          <button type="button" className="btn-primary w-full">
            Send Message
          </button>
          <p className="text-center text-xs text-ink-muted">
            Demo form — submissions are not stored.
          </p>
        </form>
      </div>
    </div>
  );
}
