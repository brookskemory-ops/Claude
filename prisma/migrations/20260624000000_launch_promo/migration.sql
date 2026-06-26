-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "launchDiscountPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "promoText" TEXT NOT NULL DEFAULT '';


-- Seed the launch promo on the existing singleton row.
UPDATE "SiteConfig"
SET "promoText" = 'Launch offer — 20% off, applied automatically at checkout',
    "launchDiscountPercent" = 20
WHERE "id" = 'singleton';
