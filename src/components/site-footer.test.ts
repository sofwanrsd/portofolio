import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { defaultSettings } from "@/lib/settings";
import { SiteFooter } from "./site-footer";
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: React.ReactNode }) => createElement("a", props, children) }));

describe("professional footer copy", () => {
  it("uses the professional tagline rather than the full biography as fallback", () => {
    const settings = structuredClone(defaultSettings);
    settings.site.description = "BIO LENGKAP KHUSUS HALAMAN TENTANG";
    settings.site.tagline = "Network & Infrastructure Engineer";
    settings.footer.tagline = "";
    const html = renderToStaticMarkup(createElement(SiteFooter, { settings }));
    expect(html.includes("Network &amp; Infrastructure Engineer")).toBe(true);
    expect(html.includes(settings.site.description)).toBe(false);
  });
  it("preserves the custom footer tagline", () => {
    const settings = structuredClone(defaultSettings);
    settings.footer.tagline = "Jaringan, infrastruktur, dan pengembangan aplikasi.";
    const html = renderToStaticMarkup(createElement(SiteFooter, { settings }));
    expect(html.includes(settings.footer.tagline)).toBe(true);
    expect(html.includes(settings.site.description)).toBe(false);
  });
});
