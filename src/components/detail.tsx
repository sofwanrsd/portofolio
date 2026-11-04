import Link from "next/link";
import { ArrowLeft, ArrowRight, Github, Globe } from "lucide-react";
import { Badge, Button, Card, Container, Section } from "@/components/ui";
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
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft size={14} /> Kembali ke Project
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{project.category}</Badge>
            {project.year && <Badge variant="outline">{project.year}</Badge>}
            {project.client && <Badge variant="outline">{project.client}</Badge>}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--muted)]">
            {project.summary}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.live_url && (
              <Button href={project.live_url} size="sm">
                <Globe size={14} /> Buka Website
              </Button>
            )}
            {project.repo_url && (
              <Button href={project.repo_url} variant="outline" size="sm">
                <Github size={14} /> Lihat Kode
              </Button>
            )}
          </div>
        </div>

        {project.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.cover_image}
            alt={project.title}
            className="mt-10 w-full rounded-[var(--radius-base)] border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="mt-10 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)]">
            <div className="bg-grid h-full w-full opacity-70" />
          </div>
        )}

        <div className="mt-10 grid gap-10 pb-16 md:grid-cols-[1.6fr_1fr]">
          <div className="prose-custom max-w-none">
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

          <aside className="space-y-6">
            <Card className="p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Tech Stack
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
              <h2 className="text-2xl font-semibold tracking-tight">
                Project lain
              </h2>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
              >
                Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
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
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          <ArrowLeft size={14} /> Kembali ke Blog
        </Link>

        <header className="mx-auto mt-6 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="accent">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-[13px] text-[var(--muted)]">
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            <span>·</span>
            <span>{readingTime(post.content)} menit baca</span>
          </div>
          {post.excerpt && (
            <p className="mt-5 text-[16px] leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.cover_image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image}
            alt={post.title}
            className="mx-auto mt-10 w-full max-w-4xl rounded-[var(--radius-base)] border border-[var(--border)] object-cover"
          />
        )}

        <div className="mx-auto mt-10 max-w-3xl pb-16">
          <MarkdownContent content={post.content} />
        </div>
      </Container>

      {related.length > 0 && (
        <Section className="border-t border-[var(--border)] bg-[var(--card)]/40">
          <Container>
            <h2 className="mb-8 text-2xl font-semibold tracking-tight">
              Baca juga
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Card
                  key={item.id}
                  className="group p-5 transition-colors hover:border-[var(--accent)]/40"
                >
                  <Link href={`/blog/${item.slug}`}>
                    <p className="text-[11.5px] text-[var(--muted)]">
                      {formatDate(item.published_at ?? item.created_at)}
                    </p>
                    <h3 className="mt-2 text-[14.5px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--accent)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[13px] text-[var(--muted)]">
                      {item.excerpt}
                    </p>
                  </Link>
                </Card>
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
