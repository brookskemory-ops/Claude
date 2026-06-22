# Axevia — Research Peptide Storefront

A full-stack e-commerce platform for **Axevia**, a supplier of research-grade peptides for
qualified research professionals. Black & white design, built with Next.js. Includes a
storefront, real user accounts, multi-step checkout with Stripe/PayPal (provider-agnostic),
product variants, inventory and order tracking, a WordPress-style admin, and Research-Use-Only
(RUO) compliance gating.

> **Research Use Only.** All products are for laboratory research use only — not for human or
> veterinary use. The site enforces an RUO acknowledgment gate and checkout attestation.

## Features
- Storefront: landing, catalog with category filter/sort, product pages with **specs**
  (purity, CAS, molecular formula, storage), **Certificate of Analysis** link, and **mg-size variants**.
- Cart (variant-aware, persists in the browser) + slide-out drawer.
- Multi-step checkout (shipping → payment → review) with coupon codes and an RUO attestation.
- **Payments are provider-agnostic**: Stripe (cards + Google Pay) and PayPal in test mode, with a
  built-in **simulated** fallback when no keys are set. Orders are created PENDING and finalized on
  payment (stock decrements atomically, oversell-guarded).
- Accounts: register, login, **password reset**, email verification, order history, saved lab addresses.
- Admin (`/admin`, admin role): dashboard, product CRUD with variants & per-product sale pricing,
  sales/coupons, order tracking, and per-variant inventory.
- Transactional email via Resend (console fallback in dev).

## Tech stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + **PostgreSQL** · cookie/JWT auth
(`jose`) + bcrypt · Stripe + PayPal.

## Running locally

### 1. Prerequisites
- **Node.js 20 LTS** — https://nodejs.org
- **A PostgreSQL database.** Two easy options:
  - **Easiest (no install): free cloud Postgres.** Create a free database at
    [neon.tech](https://neon.tech) (or Supabase) and copy its connection string.
  - **Local:** install PostgreSQL ([postgresql.org/download](https://www.postgresql.org/download/))
    or run it with Docker:
    `docker run --name axevia-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=axevia -p 5432:5432 -d postgres:16`

### 2. Install & configure
```bash
npm install
cp .env.example .env       # Windows: copy .env.example .env
```
Open `.env` and set `DATABASE_URL` to your Postgres connection string. Everything else can stay
blank to use the simulated checkout and console email.

### 3. Create the database schema + demo data
```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000.

### Demo accounts
| Role     | Email                     | Password      |
| -------- | ------------------------- | ------------- |
| Admin    | `admin@axevia.com`        | `admin123`    |
| Customer | `researcher@example.com`  | `password123` |

Demo coupons: `WELCOME10` (10% off), `AXEVIA20` (20% off).

## Adding your real catalog
The seed includes a few clearly-labeled **example** products — delete or edit them. Manage the real
catalog from **`/admin/products`**: each product has peptide specs and one or more **size variants**
(e.g. 5mg / 10mg) with their own price, SKU, sale price, and stock.

## Enabling real payments
Fill the relevant keys in `.env`:
- **Stripe (test):** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
  For local webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- **PayPal (sandbox):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
- **Email:** `RESEND_API_KEY`, `EMAIL_FROM`.

> **Production note:** Stripe and PayPal prohibit peptides/research chemicals and may freeze such
> accounts. For production you will need a **high-risk/peptide-friendly** payment processor — the
> payment layer is abstracted so a new processor drops in without rewriting checkout. Google Pay is
> only a wallet and runs on top of whichever processor you use.

## Branding
The logo is recreated as SVG components in `src/components/Logo.tsx` (monogram, wordmark, lockup).
Drop original files into `public/` to override.

## Useful scripts
| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the dev server           |
| `npm run build`    | Production build               |
| `npm run db:seed`  | Seed demo data                 |
| `npm run db:reset` | Reset the database and re-seed |

## Not yet implemented (Phase 2)
Real-time carrier shipping rates + label printing (EasyPost/Shippo), full legal suite beyond the
RUO policy, COA file uploads, reviews, error monitoring/analytics, and production deployment.
