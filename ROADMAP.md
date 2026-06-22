# Axevia — Build Roadmap

A phased plan from the current build to a fully operational research-peptide business.
Each phase lists **build** work (code I can do), **business/external** work (accounts, legal,
money — yours, though I'll prep the integrations), and a "done when" definition.

---

## ✅ Phase 0–1 — Foundation (COMPLETE)
Storefront + admin CMS · black/white brand · PostgreSQL · product variants (mg sizes) ·
provider-agnostic payments (Stripe/PayPal test + simulated) · transactional email ·
accounts with password reset/verification · Research-Use-Only compliance gate.

---

## Phase 2 — Fulfillment & Operations
**Goal:** take an order all the way to a shipped package with tracking, with peptide-grade
lot/COA traceability.

**Build**
- Shipping integration (EasyPost or Shippo): real-time rates at checkout, buy labels from
  admin, capture tracking numbers, send shipping-confirmation emails.
- Order fulfillment workflow: pack → ship (with tracking) → deliver; packing slips;
  cancellations and refunds (refund via the payment provider).
- Returns/RMA flow.
- **COA & lot tracking** (important for peptides): upload COA files per product/lot to object
  storage (Cloudflare R2 / S3), tie the COA to the lot a customer received, link it on the
  product page and in order emails.
- Inventory: low-stock email alerts, restock workflow, optional lot/batch records.

**Business/external**
- Decide carrier accounts (USPS/UPS/FedEx via EasyPost), packaging (cold-chain if needed).

**Done when:** an admin can fulfill an order, the customer gets tracking, and every order ties
to a downloadable COA.

---

## Phase 3 — Compliance, Legal & Tax
**Goal:** operate lawfully and build buyer trust — the highest-risk area for this industry.

**Build**
- Legal pages: Terms of Service, Privacy Policy, Refund/Return, Shipping policy (RUO policy
  already done); cookie/consent banner (GDPR/CCPA).
- Real sales tax: Stripe Tax or TaxJar by nexus; handle institutional **resale/exemption
  certificates**.
- Admin audit logging; security headers; harden rate limiting; data-retention controls.

**Business/external**
- Attorney review of marketing/claims (FTC/FDA) and the legal pages — strongly recommended.
- Business formation (LLC), EIN, seller's permits, **product liability insurance**.

**Done when:** policies are live, tax is calculated correctly per state, and claims have been
reviewed by counsel.

---

## Phase 4 — Production Payments & Go-Live
**Goal:** accept real money and put the site on the internet at axevia.com.

**Build**
- Integrate a **high-risk / peptide-friendly** processor into the existing payment layer
  (e.g. NMI or Authorize.Net via a high-risk acquirer). Add commonly-used alternates for this
  space (ACH/eCheck, and optionally crypto) since card acceptance can be restricted.
- Deployment: host (Vercel or similar) + managed Postgres (Neon), production secrets, custom
  domain + SSL, email domain authentication (SPF/DKIM/DMARC) for deliverability.
- Backups, error monitoring (Sentry), uptime checks.

**Business/external**
- Apply for the high-risk merchant account (approval takes time — start early).
- Register the domain and email; fund the processor account.

**Done when:** a real customer can place and pay for an order on the live domain, and you can
fulfill it. **← Minimum viable launch is end of Phase 4.**

---

## Phase 5 — Growth, Marketing & Analytics
**Goal:** drive and convert traffic.

**Build**
- SEO: metadata, sitemap.xml, robots, product structured data; a research-focused blog/content.
- Analytics & conversion tracking (GA4 + server-side events).
- Lifecycle email: working newsletter, abandoned-cart and post-purchase flows (Resend
  audiences or Klaviyo).
- B2B/wholesale: bulk/volume pricing tiers, institutional accounts (optionally net terms).
- Promotions: volume discounts, referral/loyalty; product reviews (research-appropriate).

**Done when:** organic traffic is tracked, carts are recovered, and bulk buyers have a path.

---

## Phase 6 — Scale & Hardening (ongoing)
**Goal:** reliability and team operations.

**Build**
- Multi-admin roles & granular permissions.
- Automated tests (unit/integration/e2e) + CI/CD.
- Performance: caching, image CDN, performance budget; accessibility pass.
- Customer support tooling (help desk / FAQ); optional multi-currency/i18n.

---

## Critical path to launch
Phase 2 (fulfillment + COA) → Phase 3 (legal/tax/insurance) → Phase 4 (high-risk payments +
deploy). Phases 5–6 follow launch. The long-lead items to start **now** are the high-risk
merchant account application and legal/insurance, since those gate go-live and aren't code.

## Rough recurring cost at launch
~$120–150/mo infrastructure (hosting, DB, email, monitoring, domain) + ~3–5%+ of revenue in
high-risk processing + per-label postage. One-time: legal review and insurance (the larger
spend), plus inventory. (See chat history for the detailed breakdown.)
