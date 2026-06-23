import PostForm from "../PostForm";
import { createPost } from "../../actions";

export default function NewPostPage() {
  return (
    <div>
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em]">New Post</h2>
      <PostForm action={createPost} submitLabel="Create Post" />
    </div>
  );
}
