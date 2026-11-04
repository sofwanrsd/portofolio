import Link from "next/link";
import {
  Braces,
  Briefcase,
  Code,
  Database,
  Globe,
  Layers,
  Palette,
  Rocket,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Card, Container, Section, SectionHeading } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import type { Experience, Service, Skill } from "@/lib/types";

const SKILL_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  Languages: Braces,
  Frameworks: Layers,
  Database: Database,
  Styling: Palette,
  Tools: Wrench,
  AI: Sparkles,
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
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.icon] ?? Rocket;
            return (
              <Card
                key={service.id}
                className={
                  service.popular
                    ? "relative border-[var(--accent)]/50 glow"
                    : "transition-colors hover:border-[var(--accent)]/40"
                }
              >
                {service.popular && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-accent)]">
                    Populer
                  </span>
                )}
                <div className="p-6">
                  <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-[var(--border)] bg-[var(--border)]/30">
                    <Icon size={17} />
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
                    className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] hover:underline"
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
          {services.map((service) => (
            <Card
              key={service.id}
              className={
                service.popular
                  ? "relative border-[var(--accent)]/50 glow md:-translate-y-2"
                  : ""
              }
            >
              {service.popular && (
                <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-accent)]">
                  Paling populer
                </span>
              )}
              <div className="p-6">
                <h3 className="text-[15px] font-semibold tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                  {service.description}
                </p>
                {service.price_value && (
                  <p className="mt-5 text-3xl font-semibold tracking-tight">
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
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = SKILL_ICONS[category] ?? Code;
            return (
              <Card
                key={category}
                className="overflow-hidden transition-colors hover:border-[var(--accent)]/50"
              >
                <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-5 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--border)]/30">
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
                  {items.map((skill) => (
                    <li key={skill.id}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-medium">{skill.name}</span>
                        <span className="text-[11px] tabular-nums text-[var(--muted)]">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="accent-gradient h-full rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(4, skill.level))}%`,
                          }}
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

export function ExperienceSection({
  experiences,
}: {
  experiences: Experience[];
}) {
  if (experiences.length === 0) return null;

  return (
    <Section id="experience" className="border-y border-[var(--border)] bg-[var(--card)]/40">
      <Container>
        <SectionHeading
          eyebrow="Pengalaman"
          title="Perjalanan saya"
          description="Pengalaman yang membentuk cara saya mengerjakan project."
        />
        <div className="relative">
          <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-[var(--border)]" />
          <div className="space-y-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-9">
                <span className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border-2 border-[var(--accent)] bg-[var(--bg)]" />
                <p className="text-[11.5px] uppercase tracking-wider text-[var(--muted)]">
                  {exp.period}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold tracking-tight">
                  {exp.role}
                  <span className="text-[var(--muted)]"> · {exp.company}</span>
                </h3>
                {exp.description && (
                  <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-[var(--muted)]">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
