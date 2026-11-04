import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Button, Container } from "@/components/ui";
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

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
          {site.showAvailability && site.availability && (
            <div className="rise d1 mb-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--glass)] py-1.5 pl-2.5 pr-3.5 text-[12.5px] text-[var(--muted)] backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {site.availability}
            </div>
          )}

          <h1 className="rise d2 text-balance text-[clamp(2.35rem,5.6vw,4.25rem)] font-semibold leading-[0.99] tracking-[-0.045em]">
            {titleHead}{" "}
            <span className="font-display text-gradient-accent pr-1 text-[1.08em]">{titleTail}</span>
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
              <Sparkles size={13} /> {projectsCount}+ project selesai
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
              <div className="sheen ring-accent relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card)] shadow-[0_50px_120px_-60px_color-mix(in_oklab,var(--accent)_70%,transparent)]">
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
                          <dt className="text-[var(--muted)]">Project</dt>
                          <dd className="mt-1 text-[15px] font-semibold text-[var(--fg)]">
                            {projectsCount}+
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
                            Open
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
