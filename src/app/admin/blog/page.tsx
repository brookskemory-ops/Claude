import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { deletePost } from "../actions";

export default async function AdminBlog() {
  const posts = await db.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Blog</h2>
        <Link href="/admin/blog/new" className="btn-primary btn-sm">New Post</Link>
      </div>

      {posts.length === 0 ? (
        <p className="border border-line p-8 text-center text-sm text-ink-muted">
          No posts yet. Create your first article.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 border border-line p-4">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-ink-muted">
                  <span className={p.published ? "text-ink" : ""}>
                    {p.published ? "Published" : "Draft"}
                  </span>{" "}
                  · {formatDate(p.createdAt)} · /{p.slug}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/blog/${p.id}`} className="btn-outline btn-sm">Edit</Link>
                <form action={deletePost.bind(null, p.id)}>
                  <button className="text-xs text-ink-muted underline hover:text-ink">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
