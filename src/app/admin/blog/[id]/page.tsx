import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostForm from "../PostForm";
import { updatePost } from "../../actions";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  const action = updatePost.bind(null, post.id);

  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">Edit Post</h2>
      <PostForm action={action} post={post} submitLabel="Save Post" />
    </div>
  );
}
