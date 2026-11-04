import { ImageResponse } from "next/og";
import { brandMark } from "@/lib/brand";
import { getSettings } from "@/lib/settings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Kartu pratinjau situs";

/**
 * Gambar Open Graph dinamis. Dipakai sebagai fallback ketika `seo.ogImage`
 * di pengaturan admin masih kosong, jadi pratinjau tautan tidak pernah kosong.
 */
export default async function OpengraphImage() {
  const { site, theme } = await getSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: `linear-gradient(135deg, #0a0908 0%, ${theme.accent} 140%)`,
          color: "#f4efe7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {brandMark(site)}
          </div>
          <div style={{ fontSize: 30, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            {site.heroTitle || site.tagline}
          </div>
          <div style={{ fontSize: 28, color: "#d8cfc2" }}>{site.tagline}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#a19a8f" }}>
          <span>{site.location}</span>
          <span>{site.email}</span>
        </div>
      </div>
    ),
    size,
  );
}
