import type { Metadata } from "next";
import { getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { Container, Section, SectionHeading } from "@/components/ui";
import { PricingSection } from "@/components/sections/collections";
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket layanan freelance: landing page, company website, dan custom web app.",
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const { features } = settings;

  return (
    <>
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Layanan"
            title={features.pricingTitle}
            description={features.pricingSubtitle}
            align="center"
          />
          {services.length === 0 ? (
            <p className="text-center text-sm text-[var(--muted)]">
              Paket layanan belum tersedia. Hubungi saya untuk discussing kebutuhan
              Anda.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={
                    service.popular
                      ? "relative rounded-[var(--radius-base)] border border-[var(--accent)]/50 bg-[var(--card)] p-6 glow md:-translate-y-2"
                      : "rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-6"
                  }
                >
                  {service.popular && (
                    <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
                      Paling populer
                    </span>
                  )}
                  <h2 className="text-[15px] font-semibold tracking-tight">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                    {service.description}
                  </p>
                  {service.price_value && (
                    <p className="mt-5 text-3xl font-semibold tracking-tight">
                      {formatPrice(service.price_value, service.currency)}{" "}
                      <span className="text-base font-normal text-[var(--muted)]">
                        {service.price_label}
                      </span>
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
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <Button href="/contact" size="lg">
              Diskusikan kebutuhan Anda <ArrowRight size={16} />
            </Button>
          </div>
        </Container>
      </Section>

      {features.showPricing && (
        <PricingSection
          services={services}
          title="Rincian paket"
          subtitle="Semua paket bisa disesuaikan dengan scope project Anda."
        />
      )}
    </>
  );
}
