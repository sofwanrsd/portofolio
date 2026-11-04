import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: React.ReactNode }) => createElement("a", props, children) }));
vi.mock("@/lib/settings", () => ({ getSettings: async () => ({ site: { name: "Sofwan", tagline: "Network Engineer", description: "Profil lengkap saya" }, features: {} }) }));
vi.mock("@/lib/data", () => ({ getSkills: async () => [], getProjects: async () => [], getExperiences: async () => ["work", "education", "organization", "certification"].map((kind) => ({ id: kind, kind, role: `Peran ${kind}`, company: "Instansi", start_date: "2023-01-01", end_date: "2024-01-01", period: "", description: `Detail ${kind}`, highlights: [`Kegiatan ${kind}`] })) }));
const { default: AboutPage } = await import("./about/page");
it("About has its own personal headline, section navigation and complete history", async () => {
  const html = renderToStaticMarkup(await AboutPage());
  expect(html.includes('aria-label="Cerita di balik Sofwan"')).toBe(true);
  expect(html.includes('aria-label="Jelajahi profil"')).toBe(true);
  for (const id of ["experience", "education", "organization", "certification"]) expect(html.includes(`href="#${id}"`)).toBe(true);
  for (const kind of ["work", "education", "organization", "certification"]) {
    expect(html.includes(`Detail ${kind}`)).toBe(true);
    expect(html.includes(`Kegiatan ${kind}`)).toBe(true);
  }
});
