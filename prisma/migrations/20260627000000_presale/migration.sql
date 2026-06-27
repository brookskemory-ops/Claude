-- Pre-sale: subscriber capture table.
CREATE TABLE "Subscriber" (
  "id"        TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "source"    TEXT NOT NULL DEFAULT 'presale',
  "notified"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- Drop the site-wide launch discount from 20% to 10% and refresh the promo banner copy.
UPDATE "SiteConfig"
  SET "launchDiscountPercent" = 10,
      "promoText" = 'Launch offer — 10% off, applied automatically at checkout',
      "updatedAt" = now()
  WHERE "id" = 'singleton';

-- Seed the stackable pre-sale code (extra 5% on top of the 10% launch discount = 15% total).
INSERT INTO "Coupon" ("id","code","percentOff","active","createdAt")
VALUES ('presale5', 'PRESALE5', 5, true, now())
ON CONFLICT ("code") DO UPDATE
  SET "percentOff" = 5,
      "active" = true;
