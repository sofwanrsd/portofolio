import type { Experience } from "./types";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** "2026-02" / "2026-02-01" -> "Feb 2026"; "2023" -> "2023"; kosong -> "". */
export function formatMonth(value: string): string {
  const m = /^(\d{4})(?:-(\d{2}))?/.exec(value.trim());
  if (!m) return "";
  const month = m[2] ? Number(m[2]) : 0;
  return month >= 1 && month <= 12 ? `${BULAN[month - 1]} ${m[1]}` : m[1];
}

/**
 * Teks periode untuk ditampilkan. Periode manual selalu menang; bila kosong,
 * dibentuk dari tanggal: "Feb 2026 sampai sekarang", "Sep 2024 sampai Jan 2025".
 */
export function formatPeriod(item: Pick<Experience, "period" | "start_date" | "end_date">): string {
  if (item.period?.trim()) return item.period.trim();
  const start = formatMonth(item.start_date ?? "");
  const end = formatMonth(item.end_date ?? "");
  if (!start) return end;
  if (!end) return `${start} sampai sekarang`;
  return start === end ? start : `${start} sampai ${end}`;
}

/**
 * Masih berlangsung hanya bila tanggal mulai terisi DAN tanggal selesai kosong.
 * Entri tanpa tanggal sama sekali tidak mendapat label "Saat ini", karena tidak
 * ada dasar untuk menyebutnya sedang berjalan.
 */
export function isOngoing(
  item: Pick<Experience, "start_date" | "end_date" | "period">
): boolean {
  return item.start_date.trim() !== "" && item.end_date.trim() === "" && item.period.trim() === "";
}

export type HistoryBuckets = {
  work: Experience[];
  education: Experience[];
  organization: Experience[];
  certification: Experience[];
};

const KINDS: Experience["kind"][] = ["work", "education", "organization", "certification"];

/**
 * Pisahkan riwayat menjadi empat daftar terpisah tanpa pengelompokan bertingkat.
 * Urutan masukan dipertahankan (pengurutan sudah dilakukan di query). Baris lama
 * yang belum punya `kind` diperlakukan sebagai pekerjaan.
 */
export function splitHistory(items: Experience[]): HistoryBuckets {
  const buckets: HistoryBuckets = { work: [], education: [], organization: [], certification: [] };
  for (const item of items) {
    const kind = KINDS.includes(item.kind) ? item.kind : "work";
    buckets[kind].push(item);
  }
  return buckets;
}

/** Label jenis riwayat untuk tabel admin dan keperluan lain. */
export const KIND_LABEL: Record<Experience["kind"], string> = {
  work: "Pekerjaan",
  education: "Pendidikan",
  organization: "Organisasi",
  certification: "Sertifikasi",
};

/** Kolom nomor sertifikat yang mungkin ada di data; dibaca bila diisi. */
const CERT_NUMBER_FIELDS = ["cert_number", "credential_id", "credential_number", "credential"] as const;

/** Label nomor pada deskripsi, mis. "Nomor sertifikat: DC-1123" atau "Credential ID: X". */
const CERT_NUMBER_PATTERN =
  /\b(?:no(?:mor)?|cert(?:ificate)?|credential)(?:\s+(?:sertifikat|sertifikasi|id|number|no))?\s*[:#]?\s*(?=[A-Za-z0-9._/-]*\d)([A-Za-z0-9][A-Za-z0-9._/-]{3,})/i;

function yearOf(item: Pick<Experience, "period" | "start_date" | "end_date">): string {
  const fromPeriod = /\b(19|20)\d{2}\b/g.exec(item.period ?? "")?.[0];
  if (fromPeriod) return fromPeriod;
  for (const value of [item.end_date, item.start_date]) {
    const year = /^(\d{4})/.exec((value ?? "").trim())?.[1];
    if (year) return year;
  }
  return "";
}

export type CertificateMeta = {
  /** Tahun terbit: dari periode manual, lalu tanggal selesai, lalu tanggal mulai. */
  year: string;
  /** Nomor sertifikat bila ada di data; string kosong bila memang tidak ada. */
  number: string;
  /** Deskripsi tanpa label nomor, supaya tidak tampil dua kali. */
  description: string;
};

/**
 * Detail tambahan kartu sertifikasi. Nomor dibaca dari kolom tambahan bila ada,
 * atau dari label di deskripsi. Tidak pernah dikarang: bila tidak ada, kosong.
 */
export function certificateMeta(item: Experience): CertificateMeta {
  const row = item as Experience & Record<string, unknown>;
  const fromField = CERT_NUMBER_FIELDS.map((key) => row[key]).find(
    (value): value is string => typeof value === "string" && value.trim() !== ""
  );

  const match = CERT_NUMBER_PATTERN.exec(item.description ?? "");
  const fromDescription = match?.[1]?.replace(/[.,;:]+$/, "") ?? "";
  const description = match
    ? (item.description ?? "")
        .replace(match[0], " ")
        .replace(/\s{2,}/g, " ")
        .replace(/^[\s.,;:]+/, "")
        .trim()
    : (item.description ?? "").trim();

  return {
    year: yearOf(item),
    number: (fromField ?? fromDescription).trim(),
    description,
  };
}
