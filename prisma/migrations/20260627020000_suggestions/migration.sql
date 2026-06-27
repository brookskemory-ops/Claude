-- Visitor peptide suggestions from the pre-sale landing page.
CREATE TABLE "Suggestion" (
  "id"        TEXT NOT NULL,
  "peptide"   TEXT NOT NULL,
  "email"     TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);
