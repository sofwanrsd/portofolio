import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Kunci root tracing ke folder proyek. Tanpa ini Next bisa salah mendeteksi
  // workspace root bila ada lockfile lain di direktori induk (mis. C:\Users\user),
  // yang membuat output standalone/deploy memuat berkas di luar proyek.
  outputFileTracingRoot: path.join(__dirname),
  // `next dev` dan `next start` berbagi folder .next dan saling menimpa.
  // Set NEXT_DIST_DIR=.next-preview saat build untuk mencoba versi produksi
  // tanpa menghentikan dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Jangan bocorkan versi framework lewat header X-Powered-By.
  poweredByHeader: false,
  // Tidak ada images.remotePatterns: situs memakai <img> biasa, bukan next/image.
  // Pola "**" sebelumnya membuka image optimizer untuk domain mana pun.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
