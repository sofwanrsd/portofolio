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
      {theme.showGrid && (
        <>
          <div className="bg-grid absolute inset-0 -z-10 opacity-70" />
          <div className="bg-grid-mask absolute inset-0 -z-10" />
        </>
      )}
      <div className="mesh-glow pointer-events-none absolute -top-40 left-1/2 -z-10 h-[34rem] w-[60rem] -translate-x-1/2 opacity-40" />
      <div className="bg-grid-mask pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-grid opacity-30" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
          {site.showAvailability && site.availability && (
            <div className="rise d1 mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12.5px] text-[var(--muted)]">
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

          {/* Panel visual kanan: gambar hero bila ada, jika tidak gradient mesh. */}
          <div className="fade d3 relative hidden lg:block">
            <div className="float-slow relative">
            <div className="sheen ring-accent relative overflow-hidden rounded-[26px] shadow-[0_40px_120px_-50px_color-mix(in_oklab,var(--accent)_85%,transparent)] ring-1 ring-inset ring-[var(--border)]">
              {site.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.heroImage}
                  alt={`${site.name}, ${site.tagline}`}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              ) : (
                <div className="relative flex aspect-[4/3] w-full flex-col justify-between p-6">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 12% 8%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 58%), radial-gradient(110% 85% at 88% 92%, color-mix(in oklab, var(--accent-2) 26%, transparent), transparent 60%)",
                    }}
                  />
                  <div className="bg-grid absolute inset-0 opacity-35" />

                  {/* Ornamen dekoratif: cincin konsentris, bukan data palsu. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-[36%] grid place-items-center"
                  >
                    <div className="h-32 w-32 rounded-full border border-[var(--border)]" />
                    <div className="absolute h-20 w-20 rounded-full border border-[var(--border)]" />
                    <div className="absolute h-10 w-10 rounded-full border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm" />
                  </div>

                  <div className="relative flex items-start justify-between">
                    <span className="rounded-full border border-[var(--border)] bg-[var(--card)]/70 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] backdrop-blur-sm">
                      Fokus kerja
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--card)]/70 px-2.5 py-1 text-[10.5px] font-medium text-[var(--muted)] backdrop-blur-sm">
                      {projectsCount}+ project
                    </span>
                  </div>

                  <div className="relative">
                    <p className="text-[19px] font-semibold leading-snug text-[var(--fg)]">
                      {site.tagline}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                      {site.location || "Remote"} · {site.email}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {["Performa", "Aksesibilitas", "Desain"].map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-[var(--border)] bg-[var(--card)]/70 px-2 py-2 text-center text-[11px] font-medium text-[var(--fg)]/80 backdrop-blur-sm"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
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
