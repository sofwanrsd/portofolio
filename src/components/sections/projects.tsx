import Link from "next/link";
import { Button, Card, Container, Section, SectionHeading, reveal } from "@/components/ui";
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
            {featured.slice(0, 2).map((project, i) => (
              <ProjectCard key={project.id} project={project} featured index={i} />
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            {rest.slice(0, 6).map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
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
          <div data-reveal="left">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-3 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
              Tentang saya
            </span>
            <h2 className="text-balance text-[clamp(1.9rem,4.2vw,3.15rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
              {tagline}
            </h2>
            <p aria-hidden className="ghost-num mt-8 hidden text-[9rem] md:block">
              {name.slice(0, 2).toUpperCase()}
            </p>
          </div>
          <div data-reveal="right" style={reveal(1)}>
            <p className="text-[16px] leading-relaxed text-[var(--muted)]">
              {description}
            </p>
            <Card className="mt-6 p-5">
              <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                Saya percaya website yang bagus itu cepat, enak dibaca, dan jelas
                tujuannya. Karena itu setiap project saya mulai dari pertanyaan
                &ldquo;ini solusinya apa&rdquo;. Baru soal visual.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="accent-gradient grid h-9 w-9 place-items-center rounded-lg text-[13px] font-bold text-[var(--on-accent)]">
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
