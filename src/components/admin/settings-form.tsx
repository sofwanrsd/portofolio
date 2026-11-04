"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { saveSettings, type ActionResult } from "@/app/actions/admin";
import type { AppSettings } from "@/lib/types";
import { INPUT_BASE } from "./field-schema";
import { AdminHeader, Notice, btnPrimary } from "./admin-ui";

const PANELS = [
  ["identitas", "Identitas Situs"],
  ["hero", "Hero / Headline"],
  ["tema", "Tema & Tampilan"],
  ["section", "Section Home"],
  ["jualan", "Jualan & CTA"],
  ["sosial", "Social Media"],
  ["seo", "SEO"],
  ["footer", "Footer"],
] as const;

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
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={`${INPUT_BASE} h-10`}
      />
      {hint && <p id={`${id}-hint`} className="mt-1.5 text-[11.5px] text-[var(--muted)]">{hint}</p>}
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
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} resize-y py-2.5`}
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
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--border)] bg-[var(--glass)] px-3.5 py-3 transition-colors hover:border-[color-mix(in_oklab,var(--accent)_35%,var(--border))]">
      <span className="text-[13px] font-medium">{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-[var(--border)] transition-colors duration-300 peer-checked:bg-[var(--accent)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--accent)] [&>span]:translate-x-0.5 peer-checked:[&>span]:translate-x-[22px]"
      >
        <span className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-300" />
      </span>
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
  const [dirty, setDirty] = useState(false);
  const [activePanel, setActivePanel] = useState<string>(PANELS[0][0]);

  // Tandai bagian yang sedang terlihat di menu kiri.
  useEffect(() => {
    const els = PANELS.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActivePanel(top.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Peringatkan sebelum meninggalkan halaman dengan perubahan yang belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patchSection<K extends keyof AppSettings>(
    key: K,
    values: Partial<AppSettings[K]>
  ) {
    setDirty(true);
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
      if (response.ok) {
        setDirty(false);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <AdminHeader
        eyebrow="Sistem"
        title="Pengaturan"
        description="Semua perubahan langsung diterapkan ke website setelah disimpan."
        actions={
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] ${
              dirty
                ? "border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dirty ? "bg-[var(--accent)]" : "bg-emerald-500"}`} />
            {dirty ? "Ada perubahan belum disimpan" : "Semua tersimpan"}
          </span>
        }
      />

      {result && (
        <div className="mt-5">
          <Notice ok={result.ok}>{result.message}</Notice>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[12rem_1fr]">
        <nav aria-label="Bagian pengaturan" className="hidden xl:block">
          <ul className="sticky top-24 space-y-0.5">
            {PANELS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={activePanel === id ? "location" : undefined}
                  className={`relative block rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                    activePanel === id
                      ? "bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] font-medium text-[var(--accent)] before:absolute before:inset-y-1.5 before:-left-px before:w-0.5 before:rounded-full before:bg-[var(--accent)]"
                      : "text-[var(--muted)] hover:bg-[var(--glass)] hover:text-[var(--fg)]"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
      <Panel id="identitas" title="Identitas Situs">
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

      <Panel id="hero" title="Hero / Headline">
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

      <Panel id="tema" title="Tema & Tampilan">
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
            <label htmlFor="theme-mode" className="mb-1.5 block text-[13px] font-medium">Mode</label>
            <select
              id="theme-mode"
              value={settings.theme.mode}
              onChange={(e) =>
                patchSection("theme", {
                  mode: e.target.value as "dark" | "light",
                })
              }
              className={`${INPUT_BASE} h-10`}
            >
              <option value="dark">Gelap (Dark)</option>
              <option value="light">Terang (Light)</option>
            </select>
          </div>
          <div>
            <label htmlFor="theme-radius" className="mb-1.5 block text-[13px] font-medium">Radius</label>
            <select
              id="theme-radius"
              value={settings.theme.radius}
              onChange={(e) =>
                patchSection("theme", {
                  radius: e.target.value as "soft" | "sharp" | "round",
                })
              }
              className={`${INPUT_BASE} h-10`}
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

      <Panel id="section" title="Section Home">
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

      <Panel id="jualan" title="Jualan & CTA">
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

      <Panel id="sosial" title="Social Media">
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

      <Panel id="seo" title="SEO">
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

      <Panel id="footer" title="Footer">
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

      <div className="sticky bottom-4 z-20 mt-6">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 ${
            dirty
              ? "border-[color-mix(in_oklab,var(--accent)_40%,var(--border))] bg-[color-mix(in_oklab,var(--card)_88%,transparent)] shadow-[0_24px_60px_-28px_var(--accent)]"
              : "border-[var(--border)] bg-[color-mix(in_oklab,var(--card)_80%,transparent)]"
          }`}
        >
          <p className="text-[13px] text-[var(--muted)]" aria-live="polite">
            {pending ? "Menyimpan perubahan..." : dirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}
          </p>
          <div className="flex gap-2">
            {dirty && !pending && (
              <button
                type="button"
                onClick={() => {
                  setSettings(initial);
                  setDirty(false);
                  setResult(null);
                }}
                className="inline-flex h-10 items-center rounded-xl px-3 text-[13px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
              >
                Batalkan
              </button>
            )}
            <button type="submit" disabled={pending || !dirty} className={`${btnPrimary} h-10 px-5`}>
              {pending ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} aria-hidden />}
              {pending ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </div>
      </div>
        </div>
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
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          aria-label={`${label}, pemilih warna`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ff6b1a"}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--glass)] p-1"
        />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_BASE} h-10 flex-1 font-mono text-[12.5px]`}
        />
      </div>
    </div>
  );
}

function Panel({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="surface mb-6 scroll-mt-24 rounded-2xl p-5 ring-1 ring-inset ring-[var(--border)] md:p-6"
    >
      <h2 id={`${id}-title`} className="mb-5 flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
        <span aria-hidden className="h-4 w-1 rounded-full bg-[var(--accent)]" />
        {title}
      </h2>
      {children}
    </section>
  );
}
