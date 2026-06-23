import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Research Notes",
  description: "Education and updates on research peptides, handling, storage, and quality.",
};

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-site max-w-3xl py-16">
      <p className="eyebrow">Resources</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Research Notes</h1>
      <p className="mt-3 text-ink-muted">
        Education and updates on research peptides, handling, storage, and quality.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-ink-muted">No articles published yet.</p>
      ) : (
        <div className="mt-10 divide-y divide-line border-t border-line">
          {posts.map((p) => (
            <article key={p.id} className="py-8">
              <p className="text-xs text-ink-muted">{formatDate(p.createdAt)}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              {p.excerpt && <p className="mt-2 text-ink-muted">{p.excerpt}</p>}
              <Link
                href={`/blog/${p.slug}`}
                className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
