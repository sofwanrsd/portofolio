import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getServices } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { budgetFor } from "@/lib/budget";
import { ContactForm } from "@/components/contact-form";
import { Card, Container, PageHeader, Section, reveal } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi Sofwan Rosidi untuk kebutuhan teknis, kolaborasi, atau peluang profesional.",
};

type Props = { searchParams: Promise<{ paket?: string; package?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [params, settings, services] = await Promise.all([searchParams, getSettings(), getServices()]);
  const { site, features } = settings;

  // Paket dari tombol "Pilih paket" (?paket=slug). "package" diterima untuk tautan lama.
  const chosenSlug = params.paket ?? params.package;
  const chosen = chosenSlug ? services.find((s) => s.slug === chosenSlug) : undefined;

  const channels = [
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.phone && { icon: Phone, label: "Telepon", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    site.location && { icon: MapPin, label: "Lokasi", value: site.location, href: "" },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <>
      <PageHeader
        eyebrow="Kontak"
        title={features.hireMeTitle || "Mari terhubung"}
        accent="untuk kolaborasi."
        description={features.hireMeText}
      >
        {site.showAvailability && site.availability && (
          <p className="rise d5 mt-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--glass)] py-1.5 pl-3 pr-4 text-[13px] text-[var(--fg)]">
            <span className="relative flex h-2 w-2" aria-hidden>

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {site.availability}
          </p>
        )}
      </PageHeader>

      <Section className="pt-2 md:pt-4">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.45fr] lg:gap-10">
            <div className="space-y-4">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {channels.map(({ icon: Icon, label, value, href }, i) => {
                  const body = (
                    <>
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--glass)] text-[var(--accent)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                        <Icon size={17} aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11.5px] text-[var(--muted)]">{label}</span>
                        <span className="block truncate text-[14px] font-medium">{value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={label}>
                      <Card data-reveal="left" style={reveal(i)} className="group hover:-translate-y-0.5">
                        {href ? (
                          <a href={href} className="flex items-center gap-4 rounded-[var(--radius-base)] p-4">
                            {body}
                          </a>
                        ) : (
                          <div className="flex items-center gap-4 p-4">{body}</div>
                        )}
                      </Card>
                    </li>
                  );
                })}
              </ul>

              {settings.sections.services && features.showPricing && services.length > 0 && (
                <Card data-reveal="left" style={reveal(channels.length)} className="p-5">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    Harga mulai dari
                  </h2>
                  <ul className="mt-4 divide-y divide-[var(--border)]">
                    {services.map((service) => (
                      <li key={service.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="text-[13.5px] font-medium">{service.title}</span>
                        <span className="shrink-0 text-[13.5px] font-semibold tabular-nums text-[var(--accent)]">
                          {service.price_value ? formatPrice(service.price_value, service.currency) : "Hubungi saya"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <Card id="form" data-reveal="right" className="scroll-mt-28 p-6 md:p-8">
              <h2 className="text-[clamp(1.4rem,2.4vw,1.8rem)] font-semibold tracking-[-0.03em]">
                Kirim <span className="font-display text-[var(--accent)]">pesan</span>
              </h2>
              <p className="mt-2 text-[14px] text-[var(--muted)]">
                Sampaikan kebutuhan, lingkup pekerjaan, atau peluang yang ingin dibahas. Sertakan informasi yang relevan agar saya dapat menindaklanjuti pesan Anda.
              </p>
              {chosen && (
                <div
                  role="status"
                  className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_40%,var(--border))] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] px-4 py-3"
                >
                  <CheckCircle2 size={18} aria-hidden className="shrink-0 text-[var(--accent)]" />
                  <p className="min-w-0 flex-1 text-[13.5px]">
                    Paket dipilih: <strong className="font-semibold">{chosen.title}</strong>
                    {chosen.price_value && (
                      <span className="text-[var(--muted)]">
                        {" "}
                        · mulai dari {formatPrice(chosen.price_value, chosen.currency)}
                      </span>
                    )}
                  </p>
                  <Link href="/services#pricing" className="link-grow shrink-0 text-[13px] font-medium text-[var(--accent)]">
                    Ganti paket
                  </Link>
                </div>
              )}
              <div className="mt-7">
                <ContactForm
                  key={chosen?.slug ?? "umum"}
                  defaultSubject={chosen ? `Paket ${chosen.title}` : ""}
                  defaultBudget={chosen ? budgetFor(chosen.price_value) : ""}
                />
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
