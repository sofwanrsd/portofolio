import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { Button, Card, Container, Section, SectionHeading } from "@/components/ui";
import { formatDate, readingTime } from "@/lib/utils";
import type { AppSettings, Post, Testimonial } from "@/lib/types";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <Section id="testimonials">
      <Container>
        <SectionHeading
          eyebrow="Testimoni"
          title="Apa kata mereka"
          description="Feedback dari klien yang sudah pernah bekerja sama."
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.id}
              className="flex flex-col justify-between p-6 transition-colors hover:border-[var(--accent)]/40"
            >
              <div>
                <Quote size={20} className="text-[var(--accent)]/50" />
                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {t.content}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                <span className="accent-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[var(--on-accent)]">
                  {t.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{t.name}</p>
                  <p className="truncate text-[11.5px] text-[var(--muted)]">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function BlogSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <Section id="blog" className="border-t border-[var(--border)]">
      <Container>
        <SectionHeading
          eyebrow="Writing"
          title="Catatan terbaru"
          description="Tulisan soal teknis dan proses kerja."
          align="split"
          action={
            <Button href="/blog" variant="outline" size="sm">
              Semua artikel
            </Button>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Card
              key={post.id}
              className="group overflow-hidden transition-colors hover:border-[var(--accent)]/40"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-[11.5px] text-[var(--muted)]">
                    <time dateTime={post.published_at ?? undefined}>
                      {formatDate(post.published_at ?? post.created_at)}
                    </time>
                    <span>·</span>
                    <span>{readingTime(post.content)} menit baca</span>
                  </div>
                  <h3 className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--accent)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                    {post.excerpt}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--border)]/50 px-2 py-0.5 text-[11px] text-[var(--muted)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function CtaSection({ features }: { features: AppSettings["features"] }) {
  return (
    <Section id="cta">
      <Container>
        <div className="relative overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center md:px-14">
          {features.hireMeEnabled && (
            <>
              <div className="bg-grid absolute inset-0 opacity-50" />
              <div className="bg-grid-mask absolute inset-0" />
            </>
          )}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[100px]"
            style={{
              background:
                "radial-gradient(closest-side, var(--accent), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              {features.ctaTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
              {features.ctaText}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href={features.hireMeButtonLink || "/contact"} size="lg">
                {features.ctaButtonText}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
