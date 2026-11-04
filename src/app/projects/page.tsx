import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/data";
import { ProjectCard } from "@/components/project-card";
import { CtaSection } from "@/components/sections/content";
import { getSettings } from "@/lib/settings";
import { Container, EmptyState, PageHeader, Section } from "@/components/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyek",
  description: "Portofolio proyek jaringan komputer, aplikasi web, dan pemrograman.",
};

const CATEGORY_LABELS: Record<string, string> = {
  web: "Aplikasi web",
  ui: "UI/UX",
  automation: "Otomasi",
  mobile: "Aplikasi seluler",
  desktop: "Aplikasi desktop",
  ai: "AI",
  other: "Lainnya",
};

type Props = { searchParams: Promise<{ kategori?: string }> };

export default async function ProjectsPage({ searchParams }: Props) {
  const [{ kategori }, projects, settings] = await Promise.all([
    searchParams,
    getProjects(),
    getSettings(),
  ]);

  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const active = kategori && categories.includes(kategori) ? kategori : null;
  const shown = active ? projects.filter((p) => p.category === active) : projects;
  const clients = new Set(projects.map((p) => p.client).filter(Boolean)).size;
  const techCount = new Set(projects.flatMap((p) => p.stack)).size;

  const chip = (href: string, label: string, count: number, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      scroll={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-all duration-300",
        isActive
          ? "accent-gradient border-transparent text-[var(--on-accent)]"
          : "border-[var(--border)] bg-[var(--glass)] text-[var(--muted)] hover:-translate-y-0.5 hover:text-[var(--fg)]"
      )}
    >
      {label}
      <span className={cn("tabular-nums text-[11px]", isActive ? "opacity-70" : "opacity-60")}>{count}</span>
    </Link>
  );

  return (
    <>
      <PageHeader
        eyebrow="Portofolio"
        title="Proyek dan"
        accent="implementasi"
        description="Proyek jaringan komputer, aplikasi web, dan pemrograman. Setiap proyek memuat ringkasan, teknologi yang digunakan, serta tautan yang tersedia."
        stats={[
          { label: "Proyek", value: projects.length },
          ...(clients > 0 ? [{ label: "Klien", value: clients }] : []),
          { label: "Kategori", value: categories.length },
          { label: "Teknologi", value: techCount },
        ]}
      />

      <Section className="pt-4 md:pt-6">
        <Container>
          {projects.length === 0 ? (
            <EmptyState
              title="Proyek belum tersedia"
              description="Proyek akan ditampilkan setelah dipublikasikan."
            />
          ) : (
            <>
              <nav aria-label="Filter kategori" data-reveal="fade" className="mb-10 flex flex-wrap gap-2">
                {chip("/projects", "Semua", projects.length, !active)}
                {categories.map((c) =>
                  chip(
                    `/projects?kategori=${encodeURIComponent(c)}`,
                    CATEGORY_LABELS[c] ?? c,
                    projects.filter((p) => p.category === c).length,
                    active === c
                  )
                )}
              </nav>

              <p className="sr-only" aria-live="polite">
                Menampilkan {shown.length} proyek
              </p>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {shown.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i % 3} />
                ))}
              </div>
            </>
          )}
        </Container>
      </Section>

      <CtaSection features={settings.features} />
    </>
  );
}
