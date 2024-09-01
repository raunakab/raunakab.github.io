import { BlogPosts } from "@/components/posts";
import { Metadata } from "next";

const content = {
  title: "My Blog",
};

export const metadata: Metadata = {
  title: content.title,
  description: "Read my blog.",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        {content.title}
      </h1>
      <BlogPosts />
    </section>
  );
}
