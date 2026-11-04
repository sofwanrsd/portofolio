import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ settings: null as unknown }));
vi.mock("next/link", () => ({ default: ({ children, ...props }: { children: React.ReactNode }) => createElement("a", props, children) }));
vi.mock("next/navigation", () => ({ usePathname: () => "/", notFound: () => { throw new Error("NOT_FOUND"); } }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/components/contact-form", () => ({ ContactForm: () => createElement("form") }));
vi.mock("@/lib/settings", async (importOriginal) => ({ ...await importOriginal<object>(), getSettings: async () => state.settings }));
vi.mock("@/lib/data", () => ({ getProjects: async () => [], getServices: async () => [], getPosts: async () => [] }));
import { defaultSettings } from "@/lib/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/sections/hero";
import { SkillsSection } from "@/components/sections/collections";
import ProjectsPage from "./projects/page";
import ContactPage from "./contact/page";
import ServicesPage from "./services/page";
import BlogPage from "./blog/page";
let settings: typeof defaultSettings;
beforeEach(() => { settings = structuredClone(defaultSettings); settings.site.showAvailability = false; state.settings = settings; });
const render = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("professional public presentation", () => {
  it("uses consistent Indonesian navigation", () => {
    const html = render(createElement(SiteHeader, { settings }));
    for (const label of ["Beranda", "Proyek", "Hubungi saya"]) expect(html.includes(label), label).toBe(true);
    expect(html.includes("Hire Me")).toBe(false);
  });
  it("shows exact project counts without implying verified completed client work", () => {
    const html = render(createElement(Hero, { settings, projectsCount: 8 }));
    expect(html.includes("8 proyek")).toBe(true);
    expect(html.includes("8+")).toBe(false);
    expect(html.includes("project selesai")).toBe(false);
  });
  it("keeps project pages factual and hides irrelevant client counts", async () => {
    const html = render(await ProjectsPage({ searchParams: Promise.resolve({}) }));
    expect(html.includes('aria-label="Proyek dan implementasi"')).toBe(true);
    expect(html.includes("Klien")).toBe(false);
    expect(html.includes("panel admin")).toBe(false);
  });
  it("does not advertise a response SLA or show disabled availability", async () => {
    const html = render(await ContactPage({ searchParams: Promise.resolve({}) }));
    for (const phrase of ["Ayo ngobrol", "1x24", settings.site.availability]) expect(html.includes(phrase), phrase).toBe(false);
  });
  it("lists skills without arbitrary proficiency percentages", () => {
    const html = render(createElement(SkillsSection, { skills: [{ id: "1", name: "MikroTik", category: "Networking", level: 60, sort_order: 0 }] }));
    expect(html.includes("MikroTik")).toBe(true);
    expect(html.includes('role="meter"')).toBe(false);
    expect(html.includes("60%")).toBe(false);
  });
  it("does not publish disabled service or blog pages", async () => {
    settings.sections.services = false;
    settings.sections.blog = false;
    await expect(ServicesPage()).rejects.toThrow("NOT_FOUND");
    await expect(BlogPage()).rejects.toThrow("NOT_FOUND");
  });
  it("makes footer contact details actionable", () => {
    const html = render(createElement(SiteFooter, { settings }));
    expect(html.includes(`href="mailto:${settings.site.email}"`)).toBe(true);
    expect(html.includes('href="tel:')).toBe(true);
  });
});
