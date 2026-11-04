import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PublicChrome } from "@/components/public-chrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const { seo, site } = settings;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: seo.metaTitle || `${site.name} | ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: seo.metaDescription || site.description,
    keywords: seo.keywords
      ? seo.keywords.split(",").map((k) => k.trim())
      : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      title: seo.metaTitle || site.name,
      description: seo.metaDescription || site.description,
      url: siteUrl,
      siteName: site.name,
      images: [{ url: seo.ogImage || "/opengraph-image", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.metaTitle || site.name,
      description: seo.metaDescription || site.description,
      images: [seo.ogImage || "/opengraph-image"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080c" },
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const { theme, site } = settings;

  // Preferensi tema pengunjung disimpan di cookie oleh ThemeToggle.
  // Tanpa cookie, tampilan mengikuti pengaturan di dashboard.
  const cookieTheme = (await cookies()).get("portfolio_theme")?.value;
  const mode: "light" | "dark" =
    cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : theme.mode;

  const themeVars = {
    "--accent": theme.accent,
    "--accent-2": theme.accentSecondary,
    "--radius-base":
      theme.radius === "round"
        ? "22px"
        : theme.radius === "sharp"
          ? "4px"
          : "14px",
  } as React.CSSProperties;

  return (
    <html
      lang="id"
      data-theme={mode}
      style={themeVars}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white"
        >
          Lewati ke konten utama
        </a>
        <PublicChrome>
          <SiteHeader settings={settings} />
        </PublicChrome>
        <main id="main">{children}</main>
        <PublicChrome>
          <SiteFooter settings={settings} />
        </PublicChrome>
      </body>
    </html>
  );
}
