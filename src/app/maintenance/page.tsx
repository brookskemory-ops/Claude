import type { Metadata } from "next";
import PresaleLanding from "@/components/PresaleLanding";

export const metadata: Metadata = {
  title: "Launching Soon",
  robots: { index: false, follow: false },
};

export default function MaintenancePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return <PresaleLanding error={searchParams.error === "1"} />;
}
