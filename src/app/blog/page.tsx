import { BlogPosts } from "@/components/posts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Blog",
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        {(metadata as { title: string }).title}
      </h1>
      <BlogPosts />
    </section>
  );
}
