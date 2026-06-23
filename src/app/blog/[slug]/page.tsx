import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  return {
    title: post?.title ?? "Article",
    description: post?.excerpt || undefined,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await db.post.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  const html = renderMarkdown(post.body);

  return (
    <article className="container-site max-w-3xl py-16">
      <Link
        href="/blog"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
      >
        ← All articles
      </Link>
      <p className="mt-6 text-xs text-ink-muted">{formatDate(post.createdAt)}</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">{post.title}</h1>
      {post.coverImageKey && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageKey} alt="" className="mt-8 w-full border border-line" />
      )}
      <div
        className="post-body mt-8 text-ink-muted"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
