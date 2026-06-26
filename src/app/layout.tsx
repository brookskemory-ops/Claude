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
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { getSession } from "@/lib/auth";
import { getSiteConfig } from "@/lib/config";
import { cookies, headers } from "next/headers";

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
  const [session, config] = await Promise.all([getSession(), getSiteConfig()]);

  // DB-driven maintenance gate (admins and access-code holders bypass).
  const maintenanceOn = config.maintenanceMode || process.env.MAINTENANCE_MODE === "on";
  const bypassCode = config.maintenanceCode || process.env.MAINTENANCE_BYPASS_CODE || "";
  const previewOk = !!bypassCode && cookies().get("axevia_preview")?.value === bypassCode;
  const pathname = headers().get("x-pathname") || "";
  const allowed = pathname.startsWith("/account/login") || pathname === "/maintenance";
  const gated = maintenanceOn && session?.role !== "ADMIN" && !previewOk && !allowed;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        {gated ? (
          <MaintenanceScreen />
        ) : (
          <>
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
              <Header session={session} promo={config.promoText} />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
            </CartProvider>
          </>
        )}
      </body>
    </html>
  );
}
