import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import CookieConsent from "@/components/CookieConsent";
import ReferralCapture from "@/components/ReferralCapture";
import Analytics from "@/components/Analytics";
import { getSession } from "@/lib/auth";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://axevia.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Axevia — Research Grade Peptides",
    template: "%s · Axevia",
  },
  description:
    "Axevia supplies high-purity, third-party tested research peptides to qualified laboratories and research professionals. For laboratory research use only.",
  openGraph: {
    title: "Axevia — Research Grade Peptides",
    description: "High-purity, third-party tested research peptides. For laboratory research use only.",
    url: siteUrl,
    siteName: "Axevia",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Axevia",
              url: siteUrl,
              description:
                "High-purity, third-party tested research peptides for qualified research professionals.",
            }),
          }}
        />
        <CartProvider>
          <Suspense>
            <ReferralCapture />
          </Suspense>
          <AgeGate />
          <Header session={session} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
