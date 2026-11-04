import type { FieldSchema, RowData } from "@/components/admin/field-schema";

export type { FieldSchema, RowData };

export type ResourceDef = {
  table: string;
  title: string;
  singular: string;
  orderBy: string;
  columns: { name: string; label: string; type?: FieldSchema["type"] }[];
  fields: FieldSchema[];
  hasSlug?: boolean;
  slugSource?: string;
  /** Nama kolom timestamp publikasi (mis. "published_at") pada tabel ini. */
  timestampColumn?: string;
};

export const RESOURCES: Record<string, ResourceDef> = {
  projects: {
    table: "projects",
    title: "Project",
    singular: "project",
    orderBy: "sort_order ASC, created_at DESC",
    hasSlug: true,
    slugSource: "title",
    columns: [
      { name: "title", label: "Judul" },
      { name: "category", label: "Kategori" },
      { name: "stack", label: "Stack", type: "tags" },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Status", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true, placeholder: "Nama project" },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk generate otomatis dari judul." },
      { name: "summary", label: "Ringkasan", type: "textarea", required: true, rows: 2, help: "Tampil di kartu project (maks 200 karakter)." },
      { name: "description", label: "Deskripsi lengkap", type: "textarea", rows: 10, help: "Mendukung heading ## dan bullet list." },
      { name: "category", label: "Kategori", type: "select", options: [
        { value: "web", label: "Web App" },
        { value: "ui", label: "UI/UX" },
        { value: "automation", label: "Automation" },
        { value: "mobile", label: "Mobile" },
        { value: "ai", label: "AI" },
        { value: "other", label: "Lainnya" },
      ], default: "web" },
      { name: "cover_image", label: "URL Cover Image", type: "text", placeholder: "https://... (kosongkan untuk placeholder otomatis)" },
      { name: "gallery", label: "Galeri (URL per baris)", type: "list" },
      { name: "stack", label: "Tech Stack (satu per baris)", type: "tags" },
      { name: "client", label: "Klien", type: "text" },
      { name: "year", label: "Tahun", type: "text", placeholder: "2025" },
      { name: "repo_url", label: "URL Repository", type: "text", placeholder: "https://github.com/..." },
      { name: "live_url", label: "URL Live Site", type: "text", placeholder: "https://..." },
      { name: "sort_order", label: "Urutan", type: "number", default: 0, help: "Angka kecil tampil lebih dulu." },
      { name: "featured", label: "Tampilkan sebagai featured", type: "boolean", default: false },
      { name: "published", label: "Publish", type: "boolean", default: true },
    ],
  },
  posts: {
    table: "posts",
    title: "Artikel",
    singular: "artikel",
    orderBy: "published_at DESC NULLS LAST, created_at DESC",
    // Menandai bahwa tabel punya kolom `published_at` yang harus diisi otomatis
    // saat artikel pertama kali dipublikasikan.
    timestampColumn: "published_at",
    hasSlug: true,
    slugSource: "title",
    columns: [
      { name: "title", label: "Judul" },
      { name: "tags", label: "Tags", type: "tags" },
      { name: "published", label: "Status", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Judul", type: "text", required: true },
      { name: "slug", label: "Slug URL", type: "text", help: "Kosongkan untuk generate otomatis." },
      { name: "excerpt", label: "Ringkasan", type: "textarea", rows: 2, required: true },
      { name: "content", label: "Isi Artikel (Markdown)", type: "textarea", rows: 18, required: true, help: "Format: ## Heading, - bullet, > kutipan." },
      { name: "cover_image", label: "URL Cover Image", type: "text" },
      { name: "tags", label: "Tags (satu per baris)", type: "tags" },
      { name: "published", label: "Publish", type: "boolean", default: true },
    ],
  },
  services: {
    table: "services",
    title: "Paket Layanan",
    singular: "paket",
    orderBy: "sort_order ASC, created_at DESC",
    hasSlug: true,
    slugSource: "title",
    columns: [
      { name: "title", label: "Paket" },
      { name: "price_value", label: "Harga" },
      { name: "popular", label: "Populer", type: "boolean" },
      { name: "published", label: "Status", type: "boolean" },
    ],
    fields: [
      { name: "title", label: "Nama Paket", type: "text", required: true },
      { name: "slug", label: "Slug URL", type: "text" },
      { name: "description", label: "Deskripsi", type: "textarea", rows: 3, required: true },
      { name: "price_label", label: "Label Harga", type: "text", placeholder: "mulai dari" },
      { name: "price_value", label: "Nilai Harga (angka)", type: "text", placeholder: "2500000" },
      { name: "currency", label: "Mata Uang", type: "select", options: [
        { value: "IDR", label: "IDR" },
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
      ], default: "IDR" },
      { name: "features", label: "Fitur (satu per baris)", type: "tags" },
      { name: "icon", label: "Ikon", type: "select", options: [
        { value: "rocket", label: "Rocket" },
        { value: "globe", label: "Globe" },
        { value: "code", label: "Code" },
        { value: "briefcase", label: "Briefcase" },
      ], default: "rocket" },
      { name: "sort_order", label: "Urutan", type: "number", default: 0 },
      { name: "popular", label: "Tandai sebagai populer", type: "boolean", default: false },
      { name: "published", label: "Publish", type: "boolean", default: true },
    ],
  },
  experience: {
    table: "experiences",
    title: "Riwayat",
    singular: "riwayat",
    orderBy: "(start_date = '') ASC, start_date DESC, sort_order ASC",
    columns: [
      { name: "role", label: "Peran / Jurusan" },
      { name: "kind", label: "Jenis" },
      { name: "company", label: "Instansi" },
      { name: "period", label: "Periode" },
    ],
    fields: [
      { name: "kind", label: "Jenis", type: "select", options: [
        { value: "work", label: "Pengalaman kerja" },
        { value: "education", label: "Pendidikan" },
        { value: "organization", label: "Organisasi / kegiatan" },
        { value: "certification", label: "Sertifikasi" },
      ], default: "work" },
      { name: "role", label: "Peran / Jurusan / Nama sertifikat", type: "text", required: true },
      { name: "company", label: "Perusahaan / Kampus / Penerbit", type: "text", required: true },
      { name: "start_date", label: "Tanggal mulai", type: "date", help: "Dipakai untuk urutan. Wajib diisi bila entri masih berlangsung." },
      { name: "end_date", label: "Tanggal selesai", type: "date", help: "Kosongkan bila masih berlangsung. Label 'Saat ini' hanya muncul bila tanggal mulai terisi." },
      { name: "period", label: "Periode (opsional)", type: "text", placeholder: "Otomatis dari tanggal, isi bila ingin teks lain", help: "Contoh: 2023. Bila kosong, dibentuk otomatis dari tanggal." },
      { name: "description", label: "Ringkasan", type: "textarea", rows: 3, help: "Ceritakan lingkup kerja atau studinya dalam satu sampai tiga kalimat." },
      { name: "highlights", label: "Poin kegiatan", type: "list", rows: 5, help: "Satu poin per baris, tampil sebagai daftar di beranda dan halaman Tentang." },
      { name: "url", label: "URL instansi", type: "text" },
      { name: "sort_order", label: "Urutan (bila tanggal sama)", type: "number", default: 0 },
    ],
  },
  skills: {
    table: "skills",
    title: "Skill",
    singular: "skill",
    orderBy: "sort_order ASC",
    columns: [
      { name: "name", label: "Nama" },
      { name: "category", label: "Kategori" },
      { name: "level", label: "Level" },
    ],
    fields: [
      { name: "name", label: "Nama Skill", type: "text", required: true },
      { name: "category", label: "Kategori", type: "text", required: true, placeholder: "Languages, Frameworks, Database..." },
      { name: "level", label: "Level (0-100)", type: "number", default: 80 },
      { name: "sort_order", label: "Urutan", type: "number", default: 0 },
    ],
  },
  testimonials: {
    table: "testimonials",
    title: "Testimoni",
    singular: "testimoni",
    orderBy: "sort_order ASC",
    columns: [
      { name: "name", label: "Nama" },
      { name: "company", label: "Perusahaan" },
      { name: "rating", label: "Rating" },
      { name: "published", label: "Status", type: "boolean" },
    ],
    fields: [
      { name: "name", label: "Nama", type: "text", required: true },
      { name: "role", label: "Jabatan", type: "text" },
      { name: "company", label: "Perusahaan", type: "text" },
      { name: "content", label: "Isi Testimoni", type: "textarea", rows: 4, required: true },
      { name: "avatar", label: "URL Avatar", type: "text" },
      { name: "rating", label: "Rating (1-5)", type: "number", default: 5 },
      { name: "sort_order", label: "Urutan", type: "number", default: 0 },
      { name: "published", label: "Tampilkan", type: "boolean", default: true },
    ],
  },
};

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES[key];
}

export function getResourceKeys(): string[] {
  return Object.keys(RESOURCES);
}
