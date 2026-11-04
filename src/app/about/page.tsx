import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getExperiences, getSkills } from "@/lib/data";
import { Container, Section, SectionHeading } from "@/components/ui";
import {
  ExperienceSection,
  SkillsSection,
} from "@/components/sections/collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Profil, pengalaman, dan skill saya.",
};

export default async function AboutPage() {
  const settings = await getSettings();
  const { site, features } = settings;
  const [skills, experiences] = await Promise.all([
    getSkills(),
    getExperiences(),
  ]);

  return (
    <>
      <Section>
        <Container>
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
              <span className="accent-gradient h-1.5 w-1.5 rounded-full" />
              Tentang saya
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl">
              {site.tagline}
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-[var(--muted)]">
              {site.description}
            </p>

            <dl className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                ["Nama", site.name],
                ["Lokasi", site.location],
                ["Email", site.email],
                ["Telepon", site.phone],
              ]
                .filter(([, value]) => Boolean(value))
                .map(([label, value]) => (
                  <div key={label} className="border-l-2 border-[var(--accent)] pl-4">
                    <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                      {label}
                    </dt>
                    <dd className="mt-1 text-[14px] font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </Container>
      </Section>

      <SkillsSection skills={skills} />
      <ExperienceSection experiences={experiences} />

      {features.hireMeEnabled && (
        <Section className="border-t border-[var(--border)] bg-[var(--card)]/40">
          <Container>
            <SectionHeading
              title={features.hireMeTitle}
              description={features.hireMeText}
              align="center"
            />
            <div className="flex justify-center">
              <a
                href={features.hireMeButtonLink || "/contact"}
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--fg)] px-6 text-[15px] font-medium text-[var(--bg)] transition-transform hover:-translate-y-px"
              >
                {features.hireMeButtonText}
              </a>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
