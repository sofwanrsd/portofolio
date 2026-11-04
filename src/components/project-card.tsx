import Link from "next/link";
import { Globe } from "lucide-react";
import { Github } from "@/components/brand-icons";
import type { Project } from "@/lib/types";
import { Badge, Card, reveal } from "@/components/ui";

/** Placeholder visual deterministik untuk project tanpa cover image. */
function CoverPlaceholder({ title, category }: { title: string; category: string }) {
  const seed = title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue = seed % 360;

  return (
    <div
      className="relative grid h-full w-full place-items-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 18%), hsl(${(hue + 60) % 360} 70% 10%))`,
      }}
    >
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute inset-0 bg-grid-mask" />
      <span className="relative text-4xl font-bold tracking-tight text-white/15">
        {title.slice(0, 2).toUpperCase()}
      </span>
      <span className="absolute bottom-3 left-4 text-[11px] uppercase tracking-widest text-white/40">
        {category}
      </span>
    </div>
  );
}

export function ProjectCard({
  project,
  featured = false,
  index = 0,
}: {
  project: Project;
  featured?: boolean;
  index?: number;
}) {
  return (
    <Card
      data-reveal=""
      style={reveal(index)}
      className="ring-accent group overflow-hidden hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--accent)_75%,transparent)]">
      <Link href={`/projects/${project.slug}`} className="block">
        <div
          className={
            featured
              ? "zoom-img aspect-[16/9] w-full overflow-hidden"
              : "zoom-img aspect-[16/10] w-full overflow-hidden"
          }
        >
          {project.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_image}
              alt={`Ilustrasi proyek ${project.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <CoverPlaceholder title={project.title} category={project.category} />
          )}
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-tight transition-colors group-hover:text-[var(--accent)]">
              {project.title}
            </h3>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--border)] transition-colors duration-300 group-hover:bg-[var(--accent)]" />
          </div>

          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
            {project.summary}
          </p>

          {project.stack.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.slice(0, 4).map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          )}

          {(project.live_url || project.repo_url) && (
            <div className="mt-4 flex items-center gap-3 text-[12px] text-[var(--muted)]">
              {project.live_url && (
                <span className="inline-flex items-center gap-1">
                  <Globe size={12} /> Situs
                </span>
              )}
              {project.repo_url && (
                <span className="inline-flex items-center gap-1">
                  <Github size={12} /> Kode
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
