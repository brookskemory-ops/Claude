import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export type SiteConfig = {
  maintenanceMode: boolean;
  maintenanceCode: string;
};

// Cached read of the singleton site config (invalidated via the "site-config" tag
// when an admin updates it). Falls back to defaults if the row doesn't exist yet.
export const getSiteConfig = unstable_cache(
  async (): Promise<SiteConfig> => {
    const row = await db.siteConfig.findUnique({ where: { id: "singleton" } });
    return {
      maintenanceMode: row?.maintenanceMode ?? false,
      maintenanceCode: row?.maintenanceCode ?? "",
    };
  },
  ["site-config"],
  { tags: ["site-config"], revalidate: 60 },
);
