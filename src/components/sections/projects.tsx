import Link from "next/link";
import { Button, Card, Container, Section, SectionHeading } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/types";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects">
      <Container>
        <SectionHeading
          eyebrow="Selected Work"
          title="Project pilihan saya"
          description="Beberapa karya terbaru, dari landing page sampai aplikasi internal yang dipakai harian."
          align="split"
          action={
            <Button href="/projects" variant="outline" size="sm">
              Lihat semua
            </Button>
          }
        />

        {featured.length > 0 && (
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            {featured.slice(0, 2).map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {rest.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

export function AboutSection({
  name,
  description,
  tagline,
}: {
  name: string;
  description: string;
  tagline: string;
}) {
  return (
    <Section id="about" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
              <span className="accent-gradient h-1.5 w-1.5 rounded-full" />
              Tentang saya
            </span>
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {tagline}
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-[var(--muted)]">
              {description}
            </p>
            <Card className="mt-6 p-5">
              <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                Saya percaya website yang bagus itu cepat, enak dibaca, dan jelas
                tujuannya. Karena itu setiap project saya mulai dari pertanyaan
                &ldquo;ini solusinya apa&rdquo;. Baru soal visual.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="accent-gradient grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold text-white">
                  {name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-[12px] text-[var(--muted)]">
                    Full-Stack Developer
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
