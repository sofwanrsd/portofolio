import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { ProjectCard } from "@/components/project-card";
import { Container, EmptyState, Section, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project",
  description: "Kumpulan project yang saya kerjakan.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Portfolio"
          title="Semua project"
          description="Karya saya dari landing page sampai aplikasi internal. Klik salah satu untuk melihat detail dan stack yang dipakai."
        />

        {projects.length === 0 ? (
          <EmptyState
            title="Belum ada project"
            description="Tambahkan project pertama Anda lewat panel admin."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
