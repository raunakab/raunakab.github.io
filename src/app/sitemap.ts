import { getBlogPosts } from "@/lib/helpers";
import { MetadataRoute } from "next";

export const baseUrl = "https://raunakab.github.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  let routes = ["", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs];
}
