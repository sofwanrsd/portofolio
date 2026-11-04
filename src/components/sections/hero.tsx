import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
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

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      {theme.showGrid && (
        <>
          <div className="bg-grid absolute inset-0 -z-10 opacity-70" />
          <div className="bg-grid-mask absolute inset-0 -z-10" />
        </>
      )}
      <div
        className="pointer-events-none absolute left-1/2 top-[-14rem] -z-10 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent), transparent 70%)",
        }}
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
          {site.showAvailability && site.availability && (
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-[12.5px] text-[var(--muted)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {site.availability}
            </div>
          )}

          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            <span className="text-gradient">{site.heroTitle}</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[var(--muted)] md:text-[17px]">
            {site.heroSubtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {site.heroCtaText && (
              <Button href={site.heroCtaLink || "/projects"} size="lg">
                {site.heroCtaText}
                <ArrowRight size={16} />
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

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[var(--muted)]">
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
          <div className="relative hidden lg:block">
            <div className="glow overflow-hidden rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)]">
              {site.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.heroImage}
                  alt={`${site.name} — ${site.tagline}`}
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
                    className="pointer-events-none absolute inset-x-0 top-16 grid place-items-center sm:top-14"
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
                          className="rounded-lg border border-[var(--border)] bg-[var(--card)]/70 px-2 py-2 text-center text-[11px] font-medium text-[var(--muted)] backdrop-blur-sm"
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
      </Container>
    </section>
  );
}
