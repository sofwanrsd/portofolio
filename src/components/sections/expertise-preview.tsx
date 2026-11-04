import { Code2, Network, Users } from "lucide-react";
import { Badge, Button, Card, Container, Section, SectionHeading, reveal } from "@/components/ui";
import type { Skill } from "@/lib/types";

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  Networking: Network,
  Languages: Code2,
  "Soft Skill": Users,
};
const CATEGORY_LABELS: Record<string, string> = {
  Networking: "Jaringan komputer",
  Languages: "Pemrograman",
  "Soft Skill": "Komunikasi & kolaborasi",
};

export function ExpertisePreview({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null;
  const groups = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
  return (
    <Section id="expertise">
      <Container>
        <SectionHeading eyebrow="Fokus keahlian" title="Kemampuan di balik karya"
          description="Keterampilan yang saya kembangkan melalui proyek, praktik kerja, dan kegiatan akademik."
          align="split" action={<Button href="/about#skills" variant="outline" size="sm">Lihat kompetensi</Button>} />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(groups).map(([category, items], i) => {
            const Icon = CATEGORY_ICONS[category] ?? Code2;
            return (
              <Card key={category} data-reveal="" style={reveal(i)} className="sheen group relative overflow-hidden p-6 hover:-translate-y-1 md:p-7">
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6"><Icon size={22} aria-hidden /></span>
                  <span aria-hidden className="ghost-num text-6xl">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="relative mt-6 text-[18px] font-semibold tracking-tight">{CATEGORY_LABELS[category] ?? category}</h3>
                <ul className="relative mt-5 flex flex-wrap gap-2">
                  {items.slice(0, 4).map((skill) => <li key={skill.id}><Badge>{skill.name}</Badge></li>)}
                </ul>
                {items.length > 4 && <p className="relative mt-4 text-[12px] text-[var(--muted)]">{items.length - 4} keterampilan lainnya di profil lengkap</p>}
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
