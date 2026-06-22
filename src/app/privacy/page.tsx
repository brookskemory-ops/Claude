import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-xs text-ink-muted">
        Template — review with legal counsel before publishing. Replace bracketed placeholders.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
        <S t="Information We Collect">
          Account details (name, email), order and shipping information, and limited technical data
          (e.g. session cookies). Payment card details are handled by our payment processor and are
          not stored on our servers.
        </S>
        <S t="How We Use It">
          To process orders and payments, ship products, provide support, prevent fraud, comply with
          law, and (with consent) send updates. We do not sell your personal information.
        </S>
        <S t="Cookies">
          We use essential cookies for sign-in, cart, and the research-use acknowledgment. Any
          analytics cookies are used only with your consent via the cookie banner.
        </S>
        <S t="Sharing">
          We share data with service providers (payment processor, shipping carriers, email
          provider) only as needed to operate the store, and as required by law.
        </S>
        <S t="Your Rights">
          Depending on your location (e.g. GDPR/CCPA), you may request access, correction, deletion,
          or export of your data. You can delete your account from your account page or by contacting
          us at [support@axevia.com].
        </S>
        <S t="Data Retention & Security">
          We retain order records as required for legal/accounting purposes and apply reasonable
          safeguards. No method of transmission or storage is 100% secure.
        </S>
        <S t="Contact">
          [Axevia LLC], [business mailing address], [support@axevia.com].
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
