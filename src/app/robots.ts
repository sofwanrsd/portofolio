import type { MetadataRoute } from "next";

// Dievaluasi saat request agar NEXT_PUBLIC_SITE_URL yang dipakai adalah nilai
// runtime (bukan nilai saat build), sama seperti sitemap.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
