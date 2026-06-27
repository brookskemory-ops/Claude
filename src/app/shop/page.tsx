import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/types";
import { minEffectivePrice } from "@/lib/pricing";

export const metadata: Metadata = { title: "Catalog" };

const DB_SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  featured: { featured: "desc" },
  newest: { createdAt: "desc" },
  name: { name: "asc" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string; stock?: string };
}) {
  const category = searchParams.category;
  const sort = searchParams.sort ?? "featured";
  const q = (searchParams.q ?? "").trim();
  const inStockOnly = searchParams.stock === "1";
  const priceSort = sort === "price-asc" || sort === "price-desc";

  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(category && CATEGORIES.includes(category as never) ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { tagline: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(inStockOnly ? { variants: { some: { active: true, stock: { gt: 0 } } } } : {}),
  };

  let products = await db.product.findMany({
    where,
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
    orderBy: priceSort ? { createdAt: "desc" } : DB_SORTS[sort] ?? DB_SORTS.featured,
  });

  if (priceSort) {
    products = [...products].sort((a, b) => {
      const pa = minEffectivePrice(a.variants);
      const pb = minEffectivePrice(b.variants);
      return sort === "price-asc" ? pa - pb : pb - pa;
    });
  }

  function tabHref(cat?: string) {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (sort !== "featured") params.set("sort", sort);
    if (q) params.set("q", q);
    if (inStockOnly) params.set("stock", "1");
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  }

  return (
    <div className="container-site py-12">
      <header className="mb-10">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Research Peptides</h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          High-purity, third-party tested compounds for laboratory research use only. Certificate
          of Analysis included with every order.
        </p>
      </header>

      <div className="flex flex-col gap-4 border-b border-line pb-4">
        <nav className="flex flex-wrap gap-2">
          <CategoryTab href={tabHref()} label="All" active={!category} />
          {CATEGORIES.map((cat) => (
            <CategoryTab key={cat} href={tabHref(cat)} label={cat} active={category === cat} />
          ))}
        </nav>

        <form className="flex flex-wrap items-center gap-3">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search compounds…"
            className="min-w-[200px] flex-1 rounded-full border border-line bg-paper px-4 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            <input type="checkbox" name="stock" value="1" defaultChecked={inStockOnly} />
            In stock
          </label>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Sort
            </label>
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-full border border-line bg-paper px-4 py-2 text-xs focus:border-ink focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="name">A–Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          <button type="submit" className="btn-outline btn-sm">Apply</button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-ink-muted">
          {q ? `No products match “${q}”.` : "No products in this category yet."}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`badge border transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-line text-ink-muted hover:border-ink hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
