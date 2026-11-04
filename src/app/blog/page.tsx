import type { Metadata } from "next";
import { getPosts } from "@/lib/data";
import { Container, EmptyState, Section, SectionHeading } from "@/components/ui";
import { formatDate, readingTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Catatan dan tulisan tentang teknis serta proses kerja.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Writing"
          title="Catatan & tulisan"
          description="Tulisan soal teknis, arsitektur, dan proses kerja saya."
        />

        {posts.length === 0 ? (
          <EmptyState
            title="Belum ada artikel"
            description="Tulis artikel pertama Anda lewat panel admin."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--accent)]/40"
              >
                <div className="flex items-center gap-2 text-[11.5px] text-[var(--muted)]">
                  <time dateTime={post.published_at ?? undefined}>
                    {formatDate(post.published_at ?? post.created_at)}
                  </time>
                  <span>·</span>
                  <span>{readingTime(post.content)} menit baca</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--accent)]">
                  {post.title}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {post.excerpt}
                </p>
                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--border)]/50 px-2 py-0.5 text-[11px] text-[var(--muted)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
