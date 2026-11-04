import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { Button, Card, Container, Section, SectionHeading, reveal } from "@/components/ui";
import { formatDate, readingTime } from "@/lib/utils";
import type { AppSettings, Post, Testimonial } from "@/lib/types";
import { MarqueeToggle } from "@/components/marquee-toggle";

function TestimonialCard({ t, hidden }: { t: Testimonial; hidden?: boolean }) {
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="spot surface mx-2 flex w-[340px] shrink-0 flex-col justify-between rounded-[var(--radius-base)] p-6 ring-1 ring-inset ring-[var(--border)] sm:w-[380px]"
    >
      <div>
        <div className="flex items-center justify-between">
          <Quote size={20} className="text-[var(--accent)]" aria-hidden />
          <div className="flex gap-0.5" role="img" aria-label={`Rating ${t.rating} dari 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                aria-hidden
                className={i < t.rating ? "fill-[var(--accent-2)] text-[var(--accent-2)]" : "text-[var(--border)]"}
              />
            ))}
          </div>
        </div>
        <blockquote className="mt-4 text-[14px] leading-relaxed text-[var(--fg)]/85">
          {t.content}
        </blockquote>
      </div>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-4">
        <span className="accent-gradient grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-[var(--on-accent)]">
          {t.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium">{t.name}</span>
          <span className="block truncate text-[11.5px] text-[var(--muted)]">
            {[t.role, t.company].filter(Boolean).join(" · ")}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;
  const half = Math.ceil(testimonials.length / 2);
  const rows = [testimonials.slice(0, half), testimonials.slice(half)].filter((r) => r.length > 0);

  return (
    <Section id="testimonials" className="overflow-hidden" data-marquee="">
      <Container>
        <SectionHeading
          eyebrow="Testimoni"
          title="Apa kata mereka"
          description="Feedback dari klien yang sudah pernah bekerja sama."
          align="center"
        />
        <div className="-mt-6 mb-8 flex justify-center md:-mt-10">
          <MarqueeToggle label="testimoni bergulir" />
        </div>
      </Container>
      <div data-reveal="fade" className="space-y-4">
        {rows.map((row, r) => (
          <div key={r} className="marquee-wrap fade-x overflow-hidden">
            <div
              className="marquee-track py-1"
              data-reverse={r % 2 === 1 ? "" : undefined}
              style={{ ["--speed" as string]: `${Math.max(30, row.length * 14)}s` } as React.CSSProperties}
            >
              {row.map((t) => (
                <TestimonialCard key={t.id} t={t} />
              ))}
              {row.map((t) => (
                <TestimonialCard key={`${t.id}-copy`} t={t} hidden />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function PostCard({ post, index = 0, large = false }: { post: Post; index?: number; large?: boolean }) {
  return (
    <Card data-reveal="" style={reveal(index)} className="group overflow-hidden hover:-translate-y-1">
      <Link href={`/blog/${post.slug}`} className={large ? "grid h-full md:grid-cols-[1.15fr_1fr]" : "block h-full"}>
        {post.cover_image && (
          <div className={large ? "zoom-img aspect-[16/10] overflow-hidden md:aspect-auto md:h-full" : "zoom-img aspect-[16/10] overflow-hidden"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        )}
        <div className={large ? "flex flex-col justify-center p-7 md:p-10" : "p-5"}>
          <div className="flex items-center gap-2 text-[11.5px] text-[var(--muted)]">
            <time dateTime={post.published_at ?? undefined}>
              {formatDate(post.published_at ?? post.created_at)}
            </time>
            <span aria-hidden>·</span>
            <span>{readingTime(post.content)} menit baca</span>
          </div>
          <h3
            className={
              large
                ? "mt-3 text-balance text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em] transition-colors group-hover:text-[var(--accent)]"
                : "mt-2.5 text-[15.5px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-[var(--accent)]"
            }
          >
            {post.title}
          </h3>
          <p className={large ? "mt-3 text-[15px] leading-relaxed text-[var(--muted)]" : "mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-[var(--muted)]"}>
            {post.excerpt}
          </p>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--glass)] px-2.5 py-0.5 text-[11px] text-[var(--muted)] ring-1 ring-inset ring-[var(--border)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
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
          {posts.slice(0, 3).map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
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
        <div
          data-reveal="scale"
          className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--card)] px-6 py-16 text-center md:px-14 md:py-24"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="bg-grid bg-grid-mask absolute inset-0 opacity-50" />
            <div className="aurora -top-20 left-[10%] h-72 w-72 bg-[var(--accent)]" />
            <div className="aurora -bottom-24 right-[8%] h-72 w-72 bg-[var(--accent-2)] [animation-delay:-6s]" />
          </div>
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
              Kolaborasi
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-balance text-[clamp(2rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
              {features.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-[var(--muted)]">
              {features.ctaText}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button href={features.hireMeButtonLink || "/contact"} size="lg">
                {features.ctaButtonText}
              </Button>
              <Button href="/projects" variant="outline" size="lg">
                Lihat proyek
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
