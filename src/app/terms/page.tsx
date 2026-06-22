import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-4 text-xs text-ink-muted">
        Template — review with legal counsel before publishing. Replace bracketed placeholders.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
        <S t="1. Agreement">
          These Terms govern your use of the website and purchases from [Axevia LLC] (&quot;Axevia,&quot;
          &quot;we,&quot; &quot;us&quot;). By using the site or placing an order you agree to these Terms and to our
          Research-Use Policy and Privacy Policy.
        </S>
        <S t="2. Research Use Only">
          All products are sold strictly for laboratory and in-vitro research use only. They are not
          for human or veterinary consumption and are not drugs, foods, or medical devices. You
          represent that you are a qualified researcher at least 21 years of age.
        </S>
        <S t="3. Eligibility & Accounts">
          You are responsible for the accuracy of your account information and for maintaining the
          confidentiality of your credentials. We may refuse service, cancel orders, or close
          accounts at our discretion.
        </S>
        <S t="4. Orders & Pricing">
          All orders are subject to acceptance and product availability. Prices and availability may
          change without notice. We may correct pricing errors and cancel affected orders.
        </S>
        <S t="5. Buyer Responsibility">
          You assume all responsibility and liability for the safe and lawful handling, storage,
          use, and disposal of products, in compliance with all applicable laws and institutional
          requirements.
        </S>
        <S t="6. Disclaimers & Limitation of Liability">
          Products are provided &quot;as is&quot; without warranties of any kind to the fullest extent
          permitted by law. To the maximum extent permitted by law, [Axevia LLC]&apos;s liability for any
          claim is limited to the amount you paid for the product at issue.
        </S>
        <S t="7. Governing Law">
          These Terms are governed by the laws of [State], without regard to conflict-of-law rules.
        </S>
        <S t="8. Contact">
          Questions about these Terms: [support@axevia.com], [business mailing address].
        </S>
      </div>
    </div>
  );
}

function S({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink">{t}</h2>
      <p>{children}</p>
    </section>
  );
}
