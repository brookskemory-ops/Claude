import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import CookieConsent from "@/components/CookieConsent";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    default: "Axevia — Research Grade Peptides",
    template: "%s · Axevia",
  },
  description:
    "Axevia supplies high-purity, third-party tested research peptides to qualified laboratories and research professionals. For laboratory research use only.",
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
        <CartProvider>
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
