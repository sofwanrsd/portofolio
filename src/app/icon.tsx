import { ImageResponse } from "next/og";
import { brandMark } from "@/lib/brand";
import { getSettings } from "@/lib/settings";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const alt = "Ikon situs";

/** Ikon tab browser mengikuti teks logo di admin, bukan huruf bawaan template. */
export const dynamic = "force-dynamic";

export default async function Icon() {
  const { site, theme } = await getSettings();
  const mark = brandMark(site);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
          color: "#140a03",
          fontSize: mark.length > 1 ? 27 : 34,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -0.5,
        }}
      >
        {mark}
      </div>
    ),
    size,
  );
}
