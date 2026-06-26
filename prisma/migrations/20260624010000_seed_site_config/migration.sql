-- Ensure the singleton SiteConfig row exists with the launch promo (the row may never
-- have been created, so a plain UPDATE would no-op).
INSERT INTO "SiteConfig" ("id","maintenanceMode","maintenanceCode","promoText","launchDiscountPercent","updatedAt")
VALUES ('singleton', false, '', 'Launch offer — 20% off, applied automatically at checkout', 20, now())
ON CONFLICT ("id") DO UPDATE
  SET "promoText" = EXCLUDED."promoText",
      "launchDiscountPercent" = EXCLUDED."launchDiscountPercent",
      "updatedAt" = now();

-- Grant admin to the owner account (idempotent; no-op if not yet registered).
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'brooks.k.emory@gmail.com';
