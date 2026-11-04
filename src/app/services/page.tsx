import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList, PenTool, Code2, Rocket, Plus } from "lucide-react";
import { getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { Card, Container, PageHeader, Section, SectionHeading, reveal } from "@/components/ui";
import { PricingSection } from "@/components/sections/collections";
import { CtaSection } from "@/components/sections/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket layanan freelance: landing page, company website, dan custom web app.",
};

const STEPS = [
  { icon: ClipboardList, title: "Diskusi & brief", time: "Penentuan kebutuhan", text: "Kita bahas tujuan, pengguna, dan ruang lingkup. Anda menerima estimasi harga dan timeline tertulis." },
  { icon: PenTool, title: "Desain", time: "Sesuai lingkup", text: "Wireframe lalu desain final di Figma. Revisi dilakukan di tahap ini, sebelum satu baris kode ditulis." },
  { icon: Code2, title: "Pengembangan", time: "Sesuai jadwal", text: "Dibangun bertahap dengan URL preview. Anda bisa mencoba progres kapan saja dari ponsel." },
  { icon: Rocket, title: "Rilis & serah terima", time: "Tahap akhir", text: "Penyiapan rilis dan serah terima sesuai kesepakatan, termasuk dokumentasi dan kebutuhan dukungan." },
];

const FAQ = [
  { q: "Apakah harga sudah termasuk domain dan hosting?", a: "Biaya domain dan hosting dibahas terpisah berdasarkan kebutuhan teknis serta penyedia yang digunakan." },
  { q: "Bagaimana sistem pembayarannya?", a: "Nilai pekerjaan dan tahapan pembayaran disepakati sebelum pengerjaan dimulai, berdasarkan ruang lingkup proyek." },
  { q: "Kalau saya belum punya desain atau konten?", a: "Kebutuhan desain, materi teks, dan gambar dibahas pada tahap awal agar tanggung jawab serta hasil pekerjaan jelas." },
  { q: "Apakah bisa mengubah konten sendiri setelah rilis?", a: "Panel pengelolaan konten dapat disertakan jika menjadi bagian dari lingkup pekerjaan yang disepakati." },
  { q: "Berapa lama dukungan setelah rilis?", a: "Masa dukungan, jenis perbaikan, dan pemeliharaan dibahas dalam kesepakatan pekerjaan." },
];

export default async function ServicesPage() {
  const settings = await getSettings();
  if (!settings.sections.services) notFound();
  const services = await getServices();
  const { features } = settings;

  return (
    <>
      <PageHeader
        eyebrow="Layanan"
        title="Dari ide sampai"
        accent="online."
        description="Paket dengan harga awal yang transparan dan ruang lingkup yang jelas. Semua bisa disesuaikan dengan kebutuhan project Anda."
      />

      {features.showPricing && services.length > 0 ? (
        <PricingSection services={services} title={features.pricingTitle} subtitle={features.pricingSubtitle} />
      ) : (
        <Section>
          <Container>
            <p className="text-center text-sm text-[var(--muted)]">
              Paket layanan belum tersedia. Hubungi saya untuk mendiskusikan kebutuhan Anda.
            </p>
          </Container>
        </Section>
      )}

      <Section className="border-y border-[var(--border)] bg-[var(--card)]/40">
        <Container>
          <SectionHeading
            eyebrow="Proses"
            title="Empat langkah, tanpa kejutan"
            description="Anda selalu tahu sedang di tahap mana dan apa yang terjadi berikutnya."
          />
          <ol className="relative grid gap-4 md:grid-cols-4">
            <span aria-hidden className="absolute left-0 right-0 top-[2.15rem] hidden h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent md:block" />
            {STEPS.map(({ icon: Icon, title, time, text }, i) => (
              <li key={title} data-reveal="" style={reveal(i)} className="relative">
                <span className="relative grid h-[4.3rem] w-[4.3rem] place-items-center rounded-2xl border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] shadow-[0_20px_40px_-30px_var(--accent)]">
                  <Icon size={22} aria-hidden />
                  <span className="accent-gradient absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-[var(--on-accent)]">
                    {i + 1}
                  </span>
                </span>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--accent)]">{time}</p>
                <h3 className="mt-1.5 text-[16px] font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-16">
            <SectionHeading
              eyebrow="FAQ"
              title="Pertanyaan yang sering muncul"
              description="Hubungi saya jika Anda memerlukan informasi lebih lanjut mengenai lingkup pekerjaan."
            />
            <div className="space-y-3">
              {FAQ.map(({ q, a }, i) => (
                <Card key={q} data-reveal="" style={reveal(i)} className="overflow-hidden">
                  <details className="group/faq">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                      {q}
                      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition-all duration-300 group-open/faq:rotate-45 group-open/faq:border-[var(--accent)] group-open/faq:text-[var(--accent)]">
                        <Plus size={15} />
                      </span>
                    </summary>
                    <p className="px-6 pb-6 text-[14px] leading-relaxed text-[var(--muted)]">{a}</p>
                  </details>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <CtaSection features={features} />
    </>
  );
}
