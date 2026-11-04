import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getServices } from "@/lib/data";
import { ContactForm } from "@/components/contact-form";
import { Container, Section, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi saya untuk discuss project Anda.",
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const { site, features } = settings;

  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Kontak"
          title={features.hireMeTitle || "Mari kerjakan project Anda"}
          description={features.hireMeText}
        />

        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div className="space-y-4">
            <div className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                Detail kontak
              </h2>
              <ul className="mt-4 space-y-3">
                {site.email && (
                  <li className="flex items-center gap-3 text-[13.5px]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)]">
                      <Mail size={14} />
                    </span>
                    <a
                      href={`mailto:${site.email}`}
                      className="truncate transition-colors hover:text-[var(--accent)]"
                    >
                      {site.email}
                    </a>
                  </li>
                )}
                {site.phone && (
                  <li className="flex items-center gap-3 text-[13.5px]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)]">
                      <Phone size={14} />
                    </span>
                    <a
                      href={`tel:${site.phone.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-[var(--accent)]"
                    >
                      {site.phone}
                    </a>
                  </li>
                )}
                {site.location && (
                  <li className="flex items-center gap-3 text-[13.5px]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border)]">
                      <MapPin size={14} />
                    </span>
                    {site.location}
                  </li>
                )}
              </ul>
            </div>

            {services.length > 0 && (
              <div className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Paket layanan
                </h2>
                <ul className="mt-4 space-y-3">
                  {services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="text-[13.5px] font-medium">
                        {service.title}
                      </span>
                      <span className="shrink-0 text-[13px] text-[var(--muted)]">
                        {service.price_value &&
                          `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
                            Number(service.price_value.replace(/\D/g, "") || 0)
                          )} ${service.currency}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {site.availability && (
              <div className="flex items-center gap-2 rounded-[var(--radius-base)] border border-emerald-500/25 bg-emerald-500/5 px-5 py-4 text-[13px] text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {site.availability}
              </div>
            )}
          </div>

          <div className="rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-[15px] font-semibold tracking-tight">
              Kirim pesan
            </h2>
            <p className="mt-1.5 text-[13px] text-[var(--muted)]">
              Isi form berikut, saya akan membalas dalam 1x24 jam.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
