import type { Metadata } from "next";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export const metadata: Metadata = {
  title: "Launching Soon",
  robots: { index: false, follow: false },
};

export default function MaintenancePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return <MaintenanceScreen error={searchParams.error === "1"} />;
}
