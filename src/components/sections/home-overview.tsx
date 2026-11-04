import Link from "next/link";
import { Award, BriefcaseBusiness, GraduationCap, Users } from "lucide-react";
import { Button, Card, Container, Section, reveal } from "@/components/ui";
import { formatPeriod, isOngoing, splitHistory } from "@/lib/history";
import type { Experience, SiteSettings } from "@/lib/types";

export function HomeOverview({ site, experiences, showAbout, showExperience }: {
  site: SiteSettings; experiences: Experience[]; showAbout: boolean; showExperience: boolean;
}) {
  const history = splitHistory(experiences);
  const work = history.work.find(isOngoing) ?? history.work[0];
  const education = history.education.find(isOngoing) ?? history.education[0];
  const previews = [
    ...(work ? [{ item: work, label: isOngoing(work) ? "Peran saat ini" : "Pengalaman terbaru", icon: BriefcaseBusiness, href: "/about#experience" }] : []),
    ...(education ? [{ item: education, label: "Pendidikan", icon: GraduationCap, href: "/about#education" }] : []),
  ];
  const hasHistory = showExperience && experiences.length > 0;
  if (!showAbout && !hasHistory) return null;
  return (
    <Section id="overview" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <div className={`grid gap-8 lg:gap-12 ${showAbout && hasHistory ? "lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
          {showAbout && (
            <div data-reveal="left" className="self-center">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">Profil singkat</span>
              <h2 className="mt-5 max-w-lg text-balance text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em]">
                Jaringan, aplikasi,<br />dan <span className="font-display text-[1.1em] text-[var(--accent)]">pengalaman.</span>
              </h2>
              <p className="mt-6 text-[17px] font-medium">{site.name}</p>
              <p className="mt-1 text-[13px] text-[var(--accent)]">{site.tagline}</p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
                Pengalaman teknis di bidang jaringan komputer dan pengembangan aplikasi, didukung pendidikan, kegiatan laboratorium, serta keterlibatan dalam organisasi.
              </p>
              <Button href="/about" variant="outline" className="mt-7">Kenali saya</Button>
            </div>
          )}
          {hasHistory && (
            <div className="grid content-start gap-4">
              {previews.map(({ item, label, icon: Icon, href }, i) => (
                <Link key={item.id} href={href} data-reveal="" style={reveal(i)} className="group block rounded-[var(--radius-base)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
                  <Card className="flex gap-4 p-5 transition-transform group-hover:-translate-y-1 md:p-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)]"><Icon size={19} aria-hidden /></span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]">{label}</p>
                      <h3 className="mt-2 text-[15px] font-semibold leading-snug group-hover:text-[var(--accent)]">{item.role}</h3>
                      <p className="mt-1 text-[13px] text-[var(--muted)]">{item.company}</p>
                      <p className="mt-3 font-mono text-[10.5px] text-[var(--muted)]">{formatPeriod(item)}</p>
                    </div>
                  </Card>
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[{ count: history.organization.length, label: "Peran organisasi", icon: Users, href: "/about#organization" }, { count: history.certification.length, label: "Sertifikasi", icon: Award, href: "/about#certification" }].filter(({ count }) => count > 0).map(({ count, label, icon: Icon, href }, i) => (
                  <Link key={href} href={href} data-reveal="" style={reveal(i + 2)} className="group rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--glass)] p-5 transition-colors hover:border-[var(--accent)]">
                    <Icon size={17} aria-hidden className="text-[var(--accent)]" />
                    <p className="mt-4 text-[30px] font-semibold leading-none tracking-tight">{String(count).padStart(2, "0")}</p>
                    <p className="mt-2 text-[12px] text-[var(--muted)]">{label}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
