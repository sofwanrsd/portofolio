import Link from "next/link";
import { Globe } from "lucide-react";
import { Github } from "@/components/brand-icons";
import { Badge, Button, Card, Container, Section, SplitWords, reveal } from "@/components/ui";
import { PostCard } from "@/components/sections/content";
import { ProjectCard } from "@/components/project-card";
import { formatDate, readingTime } from "@/lib/utils";
import type { Post, Project } from "@/lib/types";

/* ---------------- Project detail ---------------- */
export function ProjectDetail({
  project,
  related,
}: {
  project: Project;
  related: Project[];
}) {
  return (
    <article>
      <Container className="pt-10 md:pt-16">
        <Link
          href="/projects"
          className="link-grow rise inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Kembali ke proyek
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="rise d1 flex flex-wrap items-center gap-2">
            <Badge variant="accent">{project.category}</Badge>
            {project.year && <Badge variant="outline">{project.year}</Badge>}
            {project.client && <Badge variant="outline">{project.client}</Badge>}
          </div>
          <h1
            aria-label={project.title}
            className="mt-5 text-balance text-[clamp(2.3rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
          >
            <SplitWords text={project.title} />
          </h1>
          <p className="rise d4 mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
            {project.summary}
          </p>

          <div className="rise d5 mt-6 flex flex-wrap items-center gap-3">
            {project.live_url && (
              <Button href={project.live_url} size="sm">
                <Globe size={14} /> Buka situs
              </Button>
            )}
            {project.repo_url && (
              <Button href={project.repo_url} variant="outline" size="sm">
                <Github size={14} /> Lihat kode
              </Button>
            )}
          </div>
        </div>

        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={`Ilustrasi proyek ${project.title}`}
            className="pop d5 mt-12 w-full rounded-[28px] border border-[var(--border)] object-cover shadow-[0_60px_140px_-70px_color-mix(in_oklab,var(--accent)_75%,transparent)]"
          />
        ) : (
          <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)]">
            <div className="bg-grid h-full w-full opacity-70" />
          </div>
        )}

        <div className="mt-10 grid gap-10 pb-16 md:grid-cols-[1.6fr_1fr]">
          <div data-reveal="" className="prose-custom max-w-none">
            {project.description.split("\n").map((block, i) =>
              block.trim().startsWith("## ") ? (
                <h2 key={i}>{block.replace(/^##\s+/, "")}</h2>
              ) : block.trim().startsWith("### ") ? (
                <h3 key={i}>{block.replace(/^###\s+/, "")}</h3>
              ) : block.trim().startsWith("- ") ? (
                <ul key={i}>
                  {block
                    .split("\n")
                    .filter((l) => l.trim().startsWith("- "))
                    .map((l, j) => (
                      <li key={j}>{l.replace(/^-\s+/, "")}</li>
                    ))}
                </ul>
              ) : block.trim() ? (
                <p key={i}>{block}</p>
              ) : null
            )}
          </div>

          <aside data-reveal="right" className="space-y-6 md:sticky md:top-24 md:self-start">
            <Card className="p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Teknologi
              </h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.length ? (
                  project.stack.map((tech) => <Badge key={tech}>{tech}</Badge>)
                ) : (
                  <span className="text-[13px] text-[var(--muted)]">-</span>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Detail
              </h2>
              <dl className="mt-3 space-y-2.5 text-[13px]">
                {[
                  ["Kategori", project.category],
                  ["Klien", project.client],
                  ["Tahun", project.year],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-[var(--muted)]">{label}</dt>
                      <dd className="text-right font-medium">{value}</dd>
                    </div>
                  ))}
              </dl>
            </Card>

            {project.gallery.length > 0 && (
              <Card className="p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Galeri
                </h2>
                <div className="mt-3 space-y-2">
                  {project.gallery.map((image) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={image}
                      src={image}
                      alt={project.title}
                      className="w-full rounded-lg border border-[var(--border)]"
                    />
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </Container>

      {related.length > 0 && (
        <Section className="border-t border-[var(--border)] bg-[var(--card)]/40">
          <Container>
            <div className="mb-8 flex items-center justify-between">
              <h2 data-reveal="blur" className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.03em]">
                Proyek <span className="font-display text-[var(--accent)]">lainnya</span>
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
              >
                Semua proyek
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item, i) => (
                <ProjectCard key={item.id} project={item} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </article>
  );
}

/* ---------------- Post detail ---------------- */
export function PostDetail({
  post,
  related,
}: {
  post: Post;
  related: Post[];
}) {
  return (
    <article>
      <Container className="pt-10 md:pt-16">
        <Link
          href="/blog"
          className="link-grow rise inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--fg)]"
        >
          Kembali ke Blog
        </Link>

        <div aria-hidden className="read-progress" />
        <header className="mx-auto mt-6 max-w-3xl">
          <div className="rise d1 flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
          <h1
            aria-label={post.title}
            className="mt-5 text-balance text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em]"
          >
            <SplitWords text={post.title} />
          </h1>
          <div className="rise d4 mt-5 flex items-center gap-3 text-[13px] text-[var(--muted)]">
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            <span aria-hidden>·</span>
            <span>{readingTime(post.content)} menit baca</span>
          </div>
          {post.excerpt && (
            <p className="rise d5 mt-5 text-[17px] leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt=""
            className="pop d5 mx-auto mt-12 w-full max-w-4xl rounded-[28px] border border-[var(--border)] object-cover shadow-[0_60px_140px_-70px_color-mix(in_oklab,var(--accent)_75%,transparent)]"
          />
        )}

        <div className="mx-auto mt-10 max-w-3xl pb-16">
          <MarkdownContent content={post.content} />
        </div>
      </Container>

      {related.length > 0 && (
        <Section className="border-t border-[var(--border)] bg-[var(--card)]/40">
          <Container>
            <h2 data-reveal="blur" className="mb-8 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-[-0.03em]">
              Baca <span className="font-display text-[var(--accent)]">juga</span>
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item, i) => (
                <PostCard key={item.id} post={item} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </article>
  );
}

/* ---------------- Markdown renderer ---------------- */
export function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const flushList = () => {
    if (list.length === 0) return;
    const items = list.map((item, i) => <li key={i}>{item}</li>);
    out.push(
      ordered ? (
        <ol key={`l-${out.length}`}>{items}</ol>
      ) : (
        <ul key={`l-${out.length}`}>{items}</ul>
      )
    );
    list = [];
  };

  blocks.forEach((raw, i) => {
    const line = raw.trim();

    if (/^\d+\.\s+/.test(line)) {
      if (!ordered) {
        flushList();
        ordered = true;
      }
      list.push(line.replace(/^\d+\.\s+/, ""));
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      if (ordered) {
        flushList();
        ordered = false;
      }
      list.push(line.replace(/^[-*]\s+/, ""));
      return;
    }
    if (/^>\s?/.test(line)) {
      flushList();
      ordered = false;
      out.push(
        <blockquote key={i}>{line.replace(/^>\s?/, "")}</blockquote>
      );
      return;
    }
    if (/^```/.test(line)) {
      flushList();
      ordered = false;
      return;
    }
    if (/^###\s+/.test(line)) {
      flushList();
      ordered = false;
      out.push(<h3 key={i}>{line.replace(/^###\s+/, "")}</h3>);
      return;
    }
    if (/^##\s+/.test(line)) {
      flushList();
      ordered = false;
      out.push(<h2 key={i}>{line.replace(/^##\s+/, "")}</h2>);
      return;
    }
    if (/^#\s+/.test(line)) {
      flushList();
      ordered = false;
      out.push(<h2 key={i}>{line.replace(/^#\s+/, "")}</h2>);
      return;
    }
    if (/^---+$/.test(line)) {
      flushList();
      ordered = false;
      out.push(<hr key={i} />);
      return;
    }
    if (!line) {
      flushList();
      ordered = false;
      return;
    }
    flushList();
    ordered = false;
    out.push(<p key={i}>{line}</p>);
  });

  flushList();

  return <div className="prose-custom">{out}</div>;
}
