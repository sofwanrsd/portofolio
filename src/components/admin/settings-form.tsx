"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveSettings, type ActionResult } from "@/app/actions/admin";
import type { AppSettings } from "@/lib/types";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Headline",
  services: "Layanan",
  projects: "Project",
  about: "Tentang",
  skills: "Skill",
  experience: "Pengalaman",
  testimonials: "Testimoni",
  pricing: "Harga / Pricing",
  blog: "Blog",
  cta: "Call to Action",
  contact: "Kontak",
};

const SOCIAL_KEYS: { key: keyof AppSettings["socials"]; label: string }[] = [
  { key: "github", label: "GitHub" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "Twitter / X" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "whatsapp", label: "WhatsApp" },
];

function TextField({
  label,
  value,
  onChange,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
      {hint && <p className="mt-1 text-[11.5px] text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function AreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]"
      />
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5">
      <span className="text-[13px] font-medium">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-[var(--accent)]"
      />
    </label>
  );
}

export function SettingsForm({
  initial,
}: {
  initial: AppSettings;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function patchSection<K extends keyof AppSettings>(
    key: K,
    values: Partial<AppSettings[K]>
  ) {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as object), ...values },
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const payload: Record<string, Record<string, unknown>> = {
        site: { ...settings.site },
        theme: { ...settings.theme },
        sections: { ...settings.sections },
        socials: { ...settings.socials },
        seo: { ...settings.seo },
        features: { ...settings.features },
        footer: { ...settings.footer },
      };
      const response = await saveSettings(payload);
      setResult(response);
      if (response.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pengaturan</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Semua perubahan langsung diterapkan ke website.
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--fg)] px-4 text-sm font-medium text-[var(--bg)] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Simpan semua
        </button>
      </div>

      {result && (
        <p
          role="status"
          className={
            result.ok
              ? "mt-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300"
              : "mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-300"
          }
        >
          {result.message}
        </p>
      )}

      <Panel title="Identitas Situs">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Nama"
            value={settings.site.name}
            onChange={(v) => patchSection("site", { name: v })}
          />
          <TextField
            label="Teks Logo"
            value={settings.site.logoText}
            onChange={(v) => patchSection("site", { logoText: v })}
            hint="Maksimal 2 huruf."
          />
          <TextField
            label="Tagline"
            value={settings.site.tagline}
            onChange={(v) => patchSection("site", { tagline: v })}
          />
          <TextField
            label="Lokasi"
            value={settings.site.location}
            onChange={(v) => patchSection("site", { location: v })}
          />
          <TextField
            label="Email"
            value={settings.site.email}
            onChange={(v) => patchSection("site", { email: v })}
            type="email"
          />
          <TextField
            label="Telepon"
            value={settings.site.phone}
            onChange={(v) => patchSection("site", { phone: v })}
          />
        </div>
        <div className="mt-4">
          <AreaField
            label="Deskripsi singkat"
            value={settings.site.description}
            onChange={(v) => patchSection("site", { description: v })}
          />
        </div>
      </Panel>

      <Panel title="Hero / Headline">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Status ketersediaan"
            value={settings.site.availability}
            onChange={(v) => patchSection("site", { availability: v })}
          />
          <TextField
            label="Teks tombol utama"
            value={settings.site.heroCtaText}
            onChange={(v) => patchSection("site", { heroCtaText: v })}
          />
          <TextField
            label="Link tombol utama"
            value={settings.site.heroCtaLink}
            onChange={(v) => patchSection("site", { heroCtaLink: v })}
          />
          <TextField
            label="Teks tombol kedua"
            value={settings.site.heroSecondaryText}
            onChange={(v) => patchSection("site", { heroSecondaryText: v })}
          />
          <TextField
            label="Link tombol kedua"
            value={settings.site.heroSecondaryLink}
            onChange={(v) => patchSection("site", { heroSecondaryLink: v })}
          />
          <TextField
            label="URL gambar hero"
            value={settings.site.heroImage}
            onChange={(v) => patchSection("site", { heroImage: v })}
            hint="Kosongkan untuk memakai gradient mesh otomatis."
          />
        </div>
        <div className="mt-4 space-y-4">
          <AreaField
            label="Judul Hero"
            value={settings.site.heroTitle}
            onChange={(v) => patchSection("site", { heroTitle: v })}
          />
          <AreaField
            label="Subjudul Hero"
            value={settings.site.heroSubtitle}
            onChange={(v) => patchSection("site", { heroSubtitle: v })}
          />
          <ToggleField
            label="Tampilkan badge ketersediaan"
            value={settings.site.showAvailability}
            onChange={(v) => patchSection("site", { showAvailability: v })}
          />
        </div>
      </Panel>

      <Panel title="Tema & Tampilan">
        <div className="grid gap-4 md:grid-cols-2">
          <ColorField
            label="Warna Aksen"
            value={settings.theme.accent}
            onChange={(v) => patchSection("theme", { accent: v })}
          />
          <ColorField
            label="Warna Aksen Secondary"
            value={settings.theme.accentSecondary}
            onChange={(v) => patchSection("theme", { accentSecondary: v })}
          />
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Mode</label>
            <select
              value={settings.theme.mode}
              onChange={(e) =>
                patchSection("theme", {
                  mode: e.target.value as "dark" | "light",
                })
              }
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="dark">Gelap (Dark)</option>
              <option value="light">Terang (Light)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Radius</label>
            <select
              value={settings.theme.radius}
              onChange={(e) =>
                patchSection("theme", {
                  radius: e.target.value as "soft" | "sharp" | "round",
                })
              }
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            >
              <option value="soft">Lunak</option>
              <option value="sharp">Tajam</option>
              <option value="round">Bulat</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <ToggleField
            label="Tampilkan latar grid"
            value={settings.theme.showGrid}
            onChange={(v) => patchSection("theme", { showGrid: v })}
          />
        </div>
      </Panel>

      <Panel title="Section Home">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(settings.sections).map(([key, value]) => (
            <ToggleField
              key={key}
              label={SECTION_LABELS[key] ?? key}
              value={value}
              onChange={(v) =>
                patchSection("sections", { [key]: v } as Partial<
                  AppSettings["sections"]
                >)
              }
            />
          ))}
        </div>
      </Panel>

      <Panel title="Jualan & CTA">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Judul CTA"
            value={settings.features.ctaTitle}
            onChange={(v) => patchSection("features", { ctaTitle: v })}
          />
          <TextField
            label="Teks tombol CTA"
            value={settings.features.ctaButtonText}
            onChange={(v) => patchSection("features", { ctaButtonText: v })}
          />
          <TextField
            label="Judul Hire Me"
            value={settings.features.hireMeTitle}
            onChange={(v) => patchSection("features", { hireMeTitle: v })}
          />
          <TextField
            label="Judul Pricing"
            value={settings.features.pricingTitle}
            onChange={(v) => patchSection("features", { pricingTitle: v })}
          />
        </div>
        <div className="mt-4 space-y-4">
          <AreaField
            label="Teks CTA"
            value={settings.features.ctaText}
            onChange={(v) => patchSection("features", { ctaText: v })}
          />
          <AreaField
            label="Teks Hire Me"
            value={settings.features.hireMeText}
            onChange={(v) => patchSection("features", { hireMeText: v })}
          />
          <AreaField
            label="Subjudul Pricing"
            value={settings.features.pricingSubtitle}
            onChange={(v) => patchSection("features", { pricingSubtitle: v })}
          />
          <ToggleField
            label="Aktifkan banner Hire Me"
            value={settings.features.hireMeEnabled}
            onChange={(v) => patchSection("features", { hireMeEnabled: v })}
          />
          <ToggleField
            label="Tampilkan section pricing"
            value={settings.features.showPricing}
            onChange={(v) => patchSection("features", { showPricing: v })}
          />
        </div>
      </Panel>

      <Panel title="Social Media">
        <div className="grid gap-4 md:grid-cols-2">
          {SOCIAL_KEYS.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              value={settings.socials[key]}
              onChange={(v) => patchSection("socials", { [key]: v })}
              hint="URL lengkap, kosongkan untuk menyembunyikan."
            />
          ))}
        </div>
      </Panel>

      <Panel title="SEO">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Meta Title"
            value={settings.seo.metaTitle}
            onChange={(v) => patchSection("seo", { metaTitle: v })}
          />
          <TextField
            label="Keywords"
            value={settings.seo.keywords}
            onChange={(v) => patchSection("seo", { keywords: v })}
            hint="Pisahkan dengan koma."
          />
        </div>
        <div className="mt-4 space-y-4">
          <AreaField
            label="Meta Description"
            value={settings.seo.metaDescription}
            onChange={(v) => patchSection("seo", { metaDescription: v })}
          />
          <TextField
            label="URL OG Image"
            value={settings.seo.ogImage}
            onChange={(v) => patchSection("seo", { ogImage: v })}
          />
        </div>
      </Panel>

      <Panel title="Footer">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Tagline Footer"
            value={settings.footer.tagline}
            onChange={(v) => patchSection("footer", { tagline: v })}
          />
          <TextField
            label="Teks Copyright"
            value={settings.footer.copyrightText}
            onChange={(v) => patchSection("footer", { copyrightText: v })}
          />
        </div>
        <div className="mt-4">
          <ToggleField
            label="Tampilkan copyright"
            value={settings.footer.showCopyright}
            onChange={(v) => patchSection("footer", { showCopyright: v })}
          />
        </div>
      </Panel>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--fg)] px-5 text-sm font-medium text-[var(--bg)] shadow-lg disabled:opacity-60"
        >
          {pending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          Simpan semua
        </button>
      </div>
    </form>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ff6b1a"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 font-mono text-[12.5px] outline-none focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-[var(--radius-base)] border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="mb-4 text-[15px] font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
