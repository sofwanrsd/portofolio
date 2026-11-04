import { Button, Container, Section, SectionHeading } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";
import type { Project } from "@/lib/types";

export function ProjectsSection({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  const selected = [...projects.filter((p) => p.featured), ...projects.filter((p) => !p.featured)].slice(0, 4);
  return (
    <Section id="projects">
      <Container>
        <SectionHeading
          eyebrow="Karya terpilih"
          title="Dari ide menjadi karya"
          description="Pilihan proyek jaringan dan aplikasi. Jelajahi teknologi dan hasilnya di setiap proyek."
          align="split"
          action={<Button href="/projects" variant="outline" size="sm">Jelajahi semua proyek</Button>}
        />
        <div className="grid gap-5 md:grid-cols-2">
          {selected.map((project, i) => <ProjectCard key={project.id} project={project} featured={i < 2} index={i} />)}
        </div>
        <p data-reveal="fade" className="mt-6 font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          {selected.length} karya pilihan dari {projects.length} proyek
        </p>
      </Container>
    </Section>
  );
}
