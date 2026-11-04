import type { MetadataRoute } from "next";
import { getPosts, getProjects } from "@/lib/data";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const [projects, posts, settings] = await Promise.all([getProjects(), getPosts(), getSettings()]);
  const { sections } = settings;

  // Halaman yang section-nya dimatikan di pengaturan tidak dimasukkan,
  // supaya mesin pencari tidak mengindeks halaman kosong.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, changeFrequency: "weekly", priority: 0.9 },
    ...(sections.services
      ? [{ url: `${base}/services`, changeFrequency: "monthly" as const, priority: 0.8 }]
      : []),
    ...(sections.blog && posts.length > 0
      ? [{ url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.slug}`,
    lastModified: new Date(project.updated_at),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...postRoutes];
}
