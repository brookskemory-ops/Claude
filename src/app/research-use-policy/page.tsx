import type { Metadata } from "next";

export const metadata: Metadata = { title: "Research-Use Policy" };

export default function ResearchUsePolicyPage() {
  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Policy</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Research-Use Policy</h1>
      <p className="mt-4 text-ink-muted">
        This policy governs the sale and use of all products offered by Axevia. By purchasing, you
        agree to the terms below.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink-muted">
        <Section title="Research Use Only">
          All products are supplied strictly for laboratory and in-vitro research use only. They
          are not drugs, foods, dietary supplements, cosmetics, or medical devices. Products are not
          intended for human or veterinary use, nor for any diagnostic, therapeutic, or clinical
          purpose.
        </Section>
        <Section title="Eligibility">
          Products are sold only to qualified researchers, institutions, and businesses engaged in
          legitimate scientific research. By placing an order you represent that you are at least 21
          years of age and authorized to purchase and handle research materials.
        </Section>
        <Section title="Buyer Responsibility">
          The buyer is solely responsible for the safe handling, storage, use, and disposal of all
          products in accordance with applicable laws, regulations, and institutional guidelines.
          The buyer assumes all risk and liability arising from the receipt, handling, and use of
          products purchased.
        </Section>
        <Section title="No Medical Claims">
          Axevia makes no representation that any product is safe or effective for any human or
          veterinary use. No information provided by Axevia constitutes medical advice or a
          recommendation for use in humans or animals.
        </Section>
        <Section title="Handling & Storage">
          Unless otherwise noted, lyophilized products should be stored at -20°C and protected from
          light. A Certificate of Analysis is available for each lot.
        </Section>
        <Section title="Compliance">
          The buyer agrees to comply with all applicable local, state, federal, and international
          laws regarding the purchase, possession, and use of research materials. Axevia reserves
          the right to refuse or cancel any order.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-ink">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
