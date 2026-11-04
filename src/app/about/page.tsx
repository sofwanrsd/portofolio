import type { Metadata } from "next";
import { Compass, Gauge, MessagesSquare, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getExperiences, getProjects, getSkills } from "@/lib/data";
import { Card, Container, PageHeader, Section, SectionHeading, reveal } from "@/components/ui";
import {
  CertificationSection,
  EducationSection,
  ExperienceSection,
  OrganizationSection,
  SkillsSection,
} from "@/components/sections/collections";
import { CtaSection } from "@/components/sections/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Profil, cara kerja, pengalaman, dan skill saya.",
};

const PRINCIPLES = [
  {
    icon: Compass,
    title: "Pahami masalahnya dulu",
    text: "Setiap pekerjaan dimulai dari memahami kebutuhan dan kondisi yang ada, baru kemudian memilih solusi yang paling tepat.",
  },
  {
    icon: Gauge,
    title: "Andal dan terukur",
    text: "Konfigurasi dan aplikasi diuji dulu sebelum dipakai, supaya hasilnya stabil, mudah dipantau, dan mudah diperbaiki.",
  },
  {
    icon: ShieldCheck,
    title: "Aman sejak awal",
    text: "Keamanan dasar seperti firewall, pembatasan akses, dan validasi input diterapkan dari awal, bukan ditambal belakangan.",
  },
  {
    icon: MessagesSquare,
    title: "Komunikasi yang jelas",
    text: "Progres disampaikan rutin dengan bahasa yang mudah dipahami, termasuk saat ada kendala.",
  },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const { site, features } = settings;
  const [skills, experiences, projects] = await Promise.all([
    getSkills(),
    getExperiences(),
    getProjects(),
  ]);

  // Angka diambil langsung dari data, bukan perkiraan "tahun pengalaman"
  // (yang akan ikut menghitung masa sekolah).
  const workCount = experiences.filter((e) => e.kind === "work").length;
  const orgCount = experiences.filter((e) => e.kind === "organization").length;

  const details = [
    ["Nama", site.name],
    ["Lokasi", site.location],
    ["Email", site.email],
    ["Telepon", site.phone],
  ].filter(([, value]) => Boolean(value));

  return (
    <>
      <PageHeader
        eyebrow="Tentang saya"
        title="Cerita di balik"
        accent={site.name}
        description={site.description}
        stats={[
          { label: "Pengalaman kerja", value: workCount },
          { label: "Organisasi", value: orgCount },
          { label: "Project", value: projects.length },
          { label: "Teknologi", value: skills.length },
        ]}
      >
        <dl className="rise d6 mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {details.map(([label, value]) => (
            <div key={label} className="border-l-2 border-[var(--accent)] pl-4">
              <dt className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{label}</dt>
              <dd className="mt-1 text-[14px] font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="border-y border-[var(--border)] bg-[var(--card)]/40 py-5">
        <Container>
          <nav aria-label="Jelajahi profil" className="flex flex-wrap gap-2">
            {[
              { href: "#principles", label: "Cara kerja", show: true },
              { href: "#skills", label: "Keterampilan", show: skills.length > 0 },
              { href: "#experience", label: "Pengalaman", show: workCount > 0 },
              { href: "#education", label: "Pendidikan", show: experiences.some((e) => e.kind === "education") },
              { href: "#organization", label: "Organisasi", show: orgCount > 0 },
              { href: "#certification", label: "Sertifikasi", show: experiences.some((e) => e.kind === "certification") },
            ].filter((item) => item.show).map(({ href, label }) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--glass)] px-4 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">{label}</a>
            ))}
          </nav>
        </Container>
      </div>

      <Section id="principles">
        <Container>
          <SectionHeading
            eyebrow="Cara kerja"
            title="Empat hal yang selalu saya pegang"
            description="Prinsip sederhana yang saya pakai dalam setiap pekerjaan, baik jaringan maupun aplikasi."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map(({ icon: Icon, title, text }, i) => (
              <Card key={title} data-reveal="" style={reveal(i)} className="group p-7 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <span aria-hidden className="ghost-num text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                      <Icon size={18} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <SkillsSection skills={skills} />
      <ExperienceSection experiences={experiences} />
      <EducationSection experiences={experiences} />
      <OrganizationSection experiences={experiences} />
      <CertificationSection experiences={experiences} />
      {features.hireMeEnabled && <CtaSection features={features} />}
    </>
  );
}
