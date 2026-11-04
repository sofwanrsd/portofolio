import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: React.ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/sections/hero", () => ({ Hero: () => createElement("header", null, "Hero"), TechMarquee: () => createElement("div", null, "Skills marquee") }));
const state = vi.hoisted(() => ({
  settings: { site: { name: "Sofwan", tagline: "Network Engineer", description: "FULL BIO ONLY ON ABOUT", heroSubtitle: "Ringkasan hero" }, sections: { hero: true, skills: true, about: true, experience: true, projects: true }, features: {} },
}));
vi.mock("@/lib/settings", () => ({ getSettings: async () => state.settings }));
vi.mock("@/lib/data", () => ({
  getProjects: async () => Array.from({ length: 8 }, (_, i) => ({ id: String(i), slug: `p-${i}`, title: `Karya ${i + 1}`, summary: "Ringkasan karya", category: "web", stack: [], cover_image: "", year: "2026", featured: i < 2 })),
  getExperiences: async () => [
    { id: "work", kind: "work", role: "Asisten Praktikum", company: "Lab", start_date: "2026-02-01", end_date: "", period: "", description: "FULL WORK DETAILS", highlights: ["FULL WORK BULLET"] },
    { id: "edu", kind: "education", role: "S1 Teknologi Informasi", company: "Telkom", start_date: "2023-09-01", end_date: "", period: "", description: "FULL EDUCATION DETAILS", highlights: [] },
    { id: "cert", kind: "certification", role: "MTCNA", company: "MikroTik", start_date: "", end_date: "", period: "2023", description: "FULL CERT DETAILS", highlights: [] },
  ],
  getSkills: async () => [{ id: "s", name: "MikroTik", category: "Networking", level: 60 }],
  getServices: async () => [], getTestimonials: async () => [], getPosts: async () => [],
}));
const { default: HomePage } = await import("./page");
const render = async () => renderToStaticMarkup(await HomePage());

beforeEach(() => { state.settings.sections.about = true; state.settings.sections.experience = true; });

describe("Home is a curated introduction, not a duplicate About", () => {
  it("shows a compact profile and links into the complete About sections", async () => {
    const html = await render();
    expect(html).toContain("Kenali saya");
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/about#experience"');
    expect(html).toContain("Asisten Praktikum");
    expect(html).not.toContain("FULL BIO ONLY ON ABOUT");
    expect(html).not.toContain("FULL WORK BULLET");
    for (const id of ["experience", "education", "organization", "certification", "skills"]) expect(html).not.toContain(`id="${id}"`);
  });
  it("curates four projects rather than repeating the entire project catalog", async () => {
    const html = await render();
    for (let i = 1; i <= 4; i++) expect(html).toContain(`Karya ${i}`);
    expect(html).not.toContain("Karya 5");
    expect(html).toContain('href="/projects"');
  });
  it("keeps profile and experience summary independently configurable", async () => {
    state.settings.sections.about = false;
    const html = await render();
    expect(html).not.toContain("Kenali saya");
    expect(html).toContain("Asisten Praktikum");
    state.settings.sections.experience = false;
    expect(await render()).not.toContain("Asisten Praktikum");
  });
});
