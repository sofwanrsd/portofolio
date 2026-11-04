import Link from "next/link";
import { MapPin, FolderCode } from "lucide-react";
import { Button, Container, SplitWords } from "@/components/ui";
import { MarqueeToggle } from "@/components/marquee-toggle";
import type { AppSettings } from "@/lib/types";

export function Hero({
  settings,
  projectsCount,
}: {
  settings: AppSettings;
  projectsCount: number;
}) {
  const { site, theme } = settings;
  const titleWords = site.heroTitle.trim().split(/\s+/);
  const titleHead = titleWords.slice(0, -2).join(" ");
  const titleTail = titleWords.slice(-2).join(" ");

  return (
    <section className="relative overflow-hidden pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="spotlight pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]" />
      {theme.showGrid && (
        <div className="bg-grid bg-grid-mask pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] opacity-40" />
      )}
      <div className="mesh-glow pointer-events-none absolute -top-48 left-1/2 -z-10 h-[30rem] w-[56rem] -translate-x-1/2 opacity-30" />
      <div aria-hidden className="aurora -z-10 top-24 right-[4%] h-72 w-72 bg-[var(--accent)]" />
      <div aria-hidden className="aurora -z-10 bottom-0 left-[2%] h-60 w-60 bg-[var(--accent-2)] opacity-20 [animation-delay:-9s]" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
          {site.showAvailability && site.availability && (
            <div className="rise d1 mb-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--glass)] py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-[var(--muted)] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">

                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {site.availability}
            </div>
          )}

          <h1
            aria-label={site.heroTitle}
            className="text-balance text-[clamp(2.35rem,5.6vw,4.25rem)] font-semibold leading-[0.99] tracking-[-0.045em]"
          >
            <SplitWords text={titleHead} />{" "}
            <SplitWords
              text={titleTail}
              offset={titleWords.length - 2}
              className="font-display shimmer-text pr-1 text-[1.08em]"
            />
          </h1>

          <p className="rise d3 mt-6 max-w-xl text-[16px] leading-relaxed text-[var(--muted)] md:text-[17.5px]">
            {site.heroSubtitle}
          </p>

          <div className="rise d4 mt-9 flex flex-wrap items-center gap-3">
            {site.heroCtaText && (
              <Button href={site.heroCtaLink || "/projects"} size="lg">
                {site.heroCtaText}
              </Button>
            )}
            {site.heroSecondaryText && (
              <Button
                href={site.heroSecondaryLink || "/contact"}
                variant="outline"
                size="lg"
              >
                {site.heroSecondaryText}
              </Button>
            )}
          </div>

          <div className="rise d5 mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[var(--muted)]">
            {site.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {site.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <FolderCode size={13} aria-hidden /> {`${projectsCount} proyek`}
            </span>
            {site.email && (
              <Link
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-[var(--fg)]"
              >
                {site.email}
              </Link>
            )}
            </div>
          </div>

          {/* Panel visual kanan: foto bila ada, jika tidak kartu editorial. */}
          <div className="fade d3 relative hidden lg:block">
            <div className="float-slow relative">
              <div className="sheen border-spin is-live relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-[0_50px_120px_-60px_color-mix(in_oklab,var(--accent)_70%,transparent)]">
                {site.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.heroImage}
                    alt={`${site.name}, ${site.tagline}`}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative flex aspect-[4/3] w-full flex-col justify-between p-7">
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(90% 70% at 100% 0%, color-mix(in oklab, var(--accent) 34%, transparent), transparent 60%), radial-gradient(70% 60% at 0% 100%, color-mix(in oklab, var(--accent-2) 12%, transparent), transparent 65%)",
                      }}
                    />

                    <div className="relative flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--muted)]">
                      <span>Portofolio</span>
                      <span>{new Date().getFullYear()}</span>
                    </div>

                    <div className="relative">
                      <p
                        aria-hidden
                        className="font-display text-[clamp(5rem,9vw,8.5rem)] leading-[0.8] text-[var(--fg)]"
                      >
                        {site.logoText || site.name.slice(0, 2)}
                        <span className="text-[var(--accent)]">.</span>
                      </p>
                      <p className="mt-5 max-w-[22ch] text-[17px] font-medium leading-snug text-[var(--fg)]">
                        {site.tagline}
                      </p>
                    </div>

                    <div className="relative">
                      <div className="hairline-fade mb-4" />
                      <dl className="grid grid-cols-3 gap-4 text-[12px]">
                        <div>
                          <dt className="text-[var(--muted)]">Proyek</dt>
                          <dd className="mt-1 text-[15px] font-semibold tabular-nums text-[var(--fg)]">
                            <span data-count={projectsCount}>
                              {projectsCount}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[var(--muted)]">Basis</dt>
                          <dd className="mt-1 truncate text-[15px] font-semibold text-[var(--fg)]">
                            {(site.location || "Remote").split(",")[0]}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[var(--muted)]">Status</dt>
                          <dd className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--fg)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {site.showAvailability ? "Terbuka" : "Portofolio"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}


/** Pita teknologi yang bergulir pelan. Salinan kedua disembunyikan dari screen reader. */
export function TechMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-center gap-5 px-5 text-[15px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        >
          {item}
          <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label="Keterampilan teknis"
      data-marquee=""
      className="relative flex items-center gap-3 border-y border-[var(--border)] bg-[var(--card)]/40 py-5 pr-4"
    >
      <div className="marquee-wrap fade-x min-w-0 flex-1 overflow-hidden">
        <div className="marquee-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
      <MarqueeToggle label="pita teknologi" />
    </section>
  );
}
