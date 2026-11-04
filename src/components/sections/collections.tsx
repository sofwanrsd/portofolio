import Link from "next/link";
import {
  Award,
  Braces,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Code,
  Database,
  Globe,
  Layers,
  Palette,
  Rocket,
  Network,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Card, Container, Section, SectionHeading, reveal } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import type { Experience, Service, Skill } from "@/lib/types";
import { certificateMeta, formatPeriod, isOngoing, splitHistory } from "@/lib/history";

const SKILL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Languages: Braces,
  Frameworks: Layers,
  Database: Database,
  Styling: Palette,
  Tools: Wrench,
  AI: Sparkles,
  Networking: Network,
  "Soft Skill": Users,
};

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  rocket: Rocket,
  globe: Globe,
  code: Code,
  briefcase: Briefcase,
};

export function ServicesSection({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <Section id="services">
      <Container>
        <SectionHeading
          eyebrow="Layanan"
          title="Yang bisa saya kerjakan untuk Anda"
          description="Dari halaman satu halaman sampai aplikasi kustom. Harga awal transparan, scope jelas."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service, i) => {
            const Icon = SERVICE_ICONS[service.icon] ?? Rocket;
            return (
              <Card
                key={service.id}
                data-reveal=""
                style={reveal(i)}
                className={
                  service.popular
                    ? "border-spin group relative hover:-translate-y-1"
                    : "group hover:-translate-y-1"
                }
              >
                {service.popular && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-accent)]">
                    Populer
                  </span>
                )}
                <div className="p-6">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                    {service.description}
                  </p>

                  {service.features.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {service.features.slice(0, 3).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[13px] text-[var(--muted)]"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href="/services"
                    className="link-grow mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)]"
                  >
                    Lihat paket &amp; harga
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export function PricingSection({
  services,
  title,
  subtitle,
}: {
  services: Service[];
  title: string;
  subtitle: string;
}) {
  if (services.length === 0) return null;

  return (
    <Section id="pricing" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <SectionHeading
          eyebrow="Harga"
          title={title}
          description={subtitle}
          align="center"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service, i) => (
            <Card
              key={service.id}
              data-reveal="scale"
              style={reveal(i)}
              className={
                service.popular
                  ? "border-spin relative flex flex-col md:-translate-y-2"
                  : "flex flex-col hover:-translate-y-1"
              }
            >
              {service.popular && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-accent)]">
                  Paling populer
                </span>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {service.description}
                </p>
                {service.price_value && (
                  <p className="mt-5 text-[clamp(1.5rem,3.1vw,1.875rem)] font-semibold tabular-nums tracking-tight [overflow-wrap:anywhere]">
                    {formatPrice(service.price_value, service.currency)}
                  </p>
                )}
                {service.price_label && (
                  <p className="mt-1 text-[12px] text-[var(--muted)]">
                    {service.price_label}
                  </p>
                )}
                {service.features.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-[var(--border)] pt-5">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[13px] text-[var(--muted)]"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div aria-hidden className="min-h-7 flex-1" />
                <Link
                  href={`/contact?paket=${encodeURIComponent(service.slug)}#form`}
                  aria-label={`Pilih paket ${service.title}`}
                  className={
                    service.popular
                      ? "accent-gradient inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-semibold text-[var(--on-accent)] transition-transform hover:-translate-y-0.5"
                      : "inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--glass)] px-5 text-[14px] font-medium transition-all hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent)_45%,var(--border))]"
                  }
                >
                  Pilih paket
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  return (
    <Section id="skills">
      <Container>
        <SectionHeading
          eyebrow="Skills"
          title="Teknologi yang saya pakai"
          description="Stack modern yang saya pakai sehari-hari untuk membangun produk yang cepat, aman, dan siap produksi."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, items], i) => {
            const Icon = SKILL_ICONS[category] ?? Code;
            return (
              <Card
                key={category}
                data-reveal=""
                style={reveal(i)}
                className="group overflow-hidden hover:-translate-y-1"
              >
                <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:rotate-12">
                    <Icon size={15} />
                  </span>
                  <h3 className="text-[13px] font-semibold tracking-tight">
                    {category}
                  </h3>
                  <span className="ml-auto text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    {items.length}
                  </span>
                </div>
                <ul className="space-y-3 p-5">
                  {items.map((skill, j) => (
                    <li key={skill.id} style={reveal(j)}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-medium">{skill.name}</span>
                        <span className="text-[11px] tabular-nums text-[var(--muted)]">
                          {skill.level}%
                        </span>
                      </div>
                      <div
                        role="meter"
                        aria-label={`Penguasaan ${skill.name}`}
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="meter mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--border)]"
                      >
                        <span
                          className="accent-gradient block h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(4, skill.level))}%`,
                            ["--i" as string]: j,
                          } as React.CSSProperties}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function Highlights({ items, small = false }: { items: string[]; small?: boolean }) {
  if (items.length === 0) return null;
  return (
    <ul className={small ? "mt-2.5 space-y-1.5" : "mt-4 space-y-2"}>
      {items.map((item) => (
        <li
          key={item}
          className={`flex items-start gap-2.5 leading-relaxed text-[var(--muted)] ${small ? "text-[13px]" : "text-[14px]"}`}
        >
          <CheckCircle2 size={small ? 14 : 15} aria-hidden className="mt-[3px] shrink-0 text-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function OngoingBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[color-mix(in_oklab,#10b981_16%,transparent)] px-2 py-0.5 text-[10.5px] font-medium text-[color-mix(in_oklab,#10b981_70%,var(--fg))]">
      {children}
    </span>
  );
}

function Prose({ text }: { text: string }) {
  if (!text) return null;
  return <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{text}</p>;
}

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
      {children}
    </span>
  );
}

/** Pengalaman kerja: timeline vertikal dengan ringkasan dan poin tanggung jawab. */
export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const { work } = splitHistory(experiences);
  if (work.length === 0) return null;

  return (
    <Section id="experience" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <SectionHeading
          eyebrow="Pengalaman"
          title="Pengalaman kerja"
          description="Peran profesional yang pernah saya jalani, dari pekerjaan lepas sampai tim produk. Setiap entri memuat lingkup kerja dan hal yang saya tangani."
        />
        <div className="relative">
          <div aria-hidden className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-[var(--border)]" />
          <div
            aria-hidden
            data-reveal="fade"
            className="grow-y absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-[var(--accent)] via-[var(--accent-2)] to-transparent"
          />
          <ol className="space-y-10">
            {work.map((exp, i) => (
              <li key={exp.id} data-reveal="right" style={reveal(i)} className="group relative pl-10">
                <span aria-hidden className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border-2 border-[var(--accent)] bg-[var(--bg)] transition-transform duration-300 group-hover:scale-125">
                  <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[11.5px] uppercase tracking-wider text-[var(--muted)]">
                    {formatPeriod(exp)}
                  </p>
                  {isOngoing(exp) && <OngoingBadge>Saat ini</OngoingBadge>}
                </div>
                <h3 className="mt-1.5 text-[16px] font-semibold tracking-tight">{exp.role}</h3>
                <p className="text-[13.5px] text-[var(--muted)]">{exp.company}</p>
                <Prose text={exp.description} />
                <div className="max-w-2xl">
                  <Highlights items={exp.highlights} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

/** Perjalanan pendidikan: satu kartu per jenjang, tanpa kegiatan yang menempel. */
export function EducationSection({ experiences }: { experiences: Experience[] }) {
  const { education } = splitHistory(experiences);
  if (education.length === 0) return null;

  return (
    <Section id="education">
      <Container>
        <SectionHeading
          eyebrow="Pendidikan"
          title="Perjalanan pendidikan"
          description="Jenjang formal yang saya tempuh, beserta fokus studi dan hal yang saya kerjakan selama menempuhnya."
        />
        <ol className="space-y-5">
          {education.map((edu, i) => (
            <li key={edu.id}>
              <Card data-reveal="" style={reveal(i)} className="group overflow-hidden hover:-translate-y-1">
                <div className="grid gap-6 p-6 md:grid-cols-[13rem_1fr] md:gap-10 md:p-8">
                  <div>
                    <CardIcon>
                      <GraduationCap size={19} aria-hidden />
                    </CardIcon>
                    <p className="mt-4 font-mono text-[11.5px] uppercase tracking-wider text-[var(--muted)]">
                      {formatPeriod(edu)}
                    </p>
                    {isOngoing(edu) && (
                      <span className="mt-2 inline-block">
                        <OngoingBadge>Sedang ditempuh</OngoingBadge>
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[clamp(1.2rem,2.2vw,1.45rem)] font-semibold tracking-[-0.02em]">
                      {edu.role}
                    </h3>
                    <p className="mt-0.5 text-[14px] text-[var(--muted)]">{edu.company}</p>
                    <Prose text={edu.description} />
                    {edu.highlights.length > 0 && (
                      <>
                        <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--accent)]">
                          Yang saya lakukan
                        </p>
                        <Highlights items={edu.highlights} small />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/** Organisasi & kegiatan: kartu mandiri, tidak lagi menempel pada jenjang studi. */
export function OrganizationSection({ experiences }: { experiences: Experience[] }) {
  const { organization } = splitHistory(experiences);
  if (organization.length === 0) return null;

  return (
    <Section id="organization" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <SectionHeading
          eyebrow="Organisasi"
          title="Organisasi & kegiatan"
          description="Peran di himpunan, komunitas, dan kepanitiaan, baik di dalam maupun di luar kampus."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {organization.map((act, i) => (
            <li key={act.id}>
              <Card data-reveal="" style={reveal(i)} className="group h-full p-6 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <CardIcon>
                    <Users size={17} aria-hidden />
                  </CardIcon>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15.5px] font-semibold leading-snug tracking-tight">{act.role}</h3>
                    <p className="mt-0.5 text-[13px] text-[var(--muted)]">{act.company}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                        {formatPeriod(act)}
                      </p>
                      {isOngoing(act) && <OngoingBadge>Aktif</OngoingBadge>}
                    </div>
                  </div>
                </div>
                <Prose text={act.description} />
                <Highlights items={act.highlights} small />
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Sertifikasi: tahun terbit dan nomor sertifikat bila datanya tersedia. */
export function CertificationSection({ experiences }: { experiences: Experience[] }) {
  const { certification } = splitHistory(experiences);
  if (certification.length === 0) return null;

  return (
    <Section id="certification">
      <Container>
        <SectionHeading
          eyebrow="Sertifikasi"
          title="Sertifikasi & pelatihan"
          description="Sertifikat kompetensi dan kelas yang sudah saya selesaikan, lengkap dengan penerbit dan tahun terbitnya."
        />
        <ul className="grid gap-4 md:grid-cols-2">
          {certification.map((cert, i) => {
            const meta = certificateMeta(cert);
            const period = formatPeriod(cert);
            const headline = meta.year || period;
            return (
              <li key={cert.id}>
                <Card data-reveal="" style={reveal(i)} className="group h-full p-6 hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <CardIcon>
                      <Award size={17} aria-hidden />
                    </CardIcon>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15.5px] font-semibold leading-snug tracking-tight">{cert.role}</h3>
                      <p className="mt-0.5 text-[13px] text-[var(--muted)]">{cert.company}</p>
                      {(headline || meta.number) && (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-[var(--muted)]">
                          {headline && <span>{headline}</span>}
                          {headline && meta.number && (
                            <span aria-hidden className="h-3 w-px bg-[var(--border)]" />
                          )}
                          {meta.number && (
                            <span className="[overflow-wrap:anywhere]">No. {meta.number}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Prose text={meta.description} />
                  <Highlights items={cert.highlights} small />
                </Card>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
