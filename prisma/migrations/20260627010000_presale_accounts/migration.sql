-- One-time / account-locked coupon support.
ALTER TABLE "Coupon"
  ADD COLUMN "maxRedemptions" INTEGER,
  ADD COLUMN "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "userId" TEXT;

-- Pre-sale signups become real accounts; tag the source and store their issued code.
ALTER TABLE "User"
  ADD COLUMN "source" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "presaleCode" TEXT;

-- Retire the shared pre-sale code (replaced by per-account one-time codes).
UPDATE "Coupon" SET "active" = false WHERE "code" = 'PRESALE5';

-- The email-capture Subscriber table is superseded by accounts.
DROP TABLE IF EXISTS "Subscriber";
