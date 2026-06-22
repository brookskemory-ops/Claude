# Axevia — Supplement Storefront

A full-featured e-commerce storefront for the (fictional) supplement brand
**Axevia**, with a minimalist black & white design. Built with Next.js, it
includes a customer-facing store, real user accounts, a simulated checkout, and
a WordPress-style **admin portal** for managing products, sales, orders, and
inventory.

## Features

**Storefront**
- Landing page with hero, featured products, benefits, and testimonials
- Shop with category filtering and sorting
- Product detail pages with sale pricing, stock status, and related products
- Slide-out cart drawer + full cart page (persists across reloads)
- Multi-step checkout: shipping → billing → review → confirmation
- Discount/coupon codes + free-shipping threshold
- Customer accounts: registration, login, order history, saved addresses

**Admin portal** (`/admin`, admin role only)
- Dashboard: revenue, orders, low-stock at a glance
- Product CRUD with per-product **sale price** + sale end date
- **Sales & coupons** manager (percentage or fixed-amount codes)
- **Order tracking** with editable fulfillment status
- **Inventory** management with low-stock highlights and quick stock edits
- Stock auto-decrements when an order is placed; products show "Out of Stock" at zero

## Tech stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for the black & white design system
- **Prisma** ORM with **SQLite** (swap `DATABASE_URL` for Postgres in production)
- Cookie-based sessions (signed JWTs via `jose`) + **bcrypt** password hashing
- Cart state via React Context + `localStorage`

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
#   (optional) generate a strong AUTH_SECRET: openssl rand -base64 32

# 3. Create the database and load demo data
npx prisma migrate dev
npm run db:seed

# 4. Run the dev server
npm run dev
```

Visit http://localhost:3000.

### Demo accounts
| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Admin    | `admin@axevia.com`     | `admin123`    |
| Customer | `customer@example.com` | `password123` |

> Change these credentials (and `AUTH_SECRET`) before any real deployment.

### Demo coupons
- `WELCOME10` — 10% off
- `AXEVIA20` — 20% off

## Adding your real products
The seed catalog lives in `prisma/seed.ts`, but the intended workflow is to log
in as the admin and manage everything from **`/admin/products`** — create, edit,
set sale prices, toggle featured/active, and adjust stock. Changes are saved to
the database and immediately reflected across the store.

## Notes
- **Checkout is simulated** — no real payment is processed and no card data is
  stored. To go live you would integrate a processor such as Stripe.
- SQLite keeps local setup dependency-free. For production, point `DATABASE_URL`
  at a hosted Postgres instance and change the Prisma datasource `provider` to
  `postgresql`.

## Useful scripts
| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the dev server                 |
| `npm run build`    | Production build                     |
| `npm run start`    | Run the production build             |
| `npm run db:seed`  | Seed demo data                       |
| `npm run db:reset` | Reset the database and re-seed       |
