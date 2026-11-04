import type { Metadata } from "next";
import { getServices } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { Button, Card, Container, Section, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Paket layanan freelance: landing page, company website, dan custom web app.",
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  const { features } = settings;

  return (
    <Section id="pricing">
      <Container>
        <SectionHeading
          eyebrow="Layanan"
          title={features.pricingTitle}
          description={features.pricingSubtitle}
          align="center"
        />

        {!features.showPricing ? null : services.length === 0 ? (
          <p className="text-center text-sm text-[var(--muted)]">
            Paket layanan belum tersedia. Hubungi saya untuk mendiskusikan kebutuhan
            Anda.
          </p>
        ) : (
          <>
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
                    <span className="absolute -top-2.5 left-5 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-semibold text-white">
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
                      <div className="mt-5">
                        {service.price_label && (
                          <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                            {service.price_label}
                          </p>
                        )}
                        <p className="mt-1 text-3xl font-semibold tracking-tight">
                          {formatPrice(service.price_value, service.currency)}
                        </p>
                      </div>
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

            <div className="mt-12 flex justify-center">
              <Button href="/contact" size="lg">
                Diskusikan kebutuhan Anda
              </Button>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
