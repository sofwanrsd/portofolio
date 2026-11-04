/**
 * Format tampilan: tanggal Indonesia, mata uang, excerpt, waktu baca.
 * Di dokumentasikan pada PROJECT/04-ARCHITECTURE/system-architecture.md §4.2.
 */

/** Tanggal panjang Indonesia, mis. "4 November 2026". */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Tanggal + waktu Indonesia, mis. "4 Nov 2026, 22.13". */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Normalisasi nominal dari berbagai format penulisan menjadi number.
 * Menangani `2500000`, `2.500.000`, `2,500,000`, `2.500.000,50`, dan `2500000.5`.
 * Mengembalikan `null` bila tidak ada angka yang bisa dibaca.
 */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;

  const hasDot = cleaned.includes(".");
  const hasComma = cleaned.includes(",");
  let normalized = cleaned;

  if (hasDot && hasComma) {
    // `1.234.567,89` (id) vs `1,234,567.89` (en) - pemisah desimal adalah yang terakhir.
    normalized =
      cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (hasDot) {
    // `2.500.000` = ribuan; `2500000.5` = desimal.
    normalized = /^\d{1,3}(\.\d{3})+$/.test(cleaned) ? cleaned.replace(/\./g, "") : cleaned;
  } else if (hasComma) {
    normalized = /^\d{1,3}(,\d{3})+$/.test(cleaned) ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

/**
 * Format nominal dengan simbol mata uang.
 * Nilai non-numeric dikembalikan apa adanya supaya data mentah tidak hilang.
 */
export function formatPrice(value: string, currency: string): string {
  const numeric = parseAmount(value);
  if (numeric === null || numeric === 0) return value;

  const symbol =
    currency === "IDR" ? "Rp" : currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;

  const formatted = new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    maximumFractionDigits: 0,
  }).format(numeric);

  return `${symbol}${formatted}`;
}

/** Estimasi waktu baca artikel dalam menit (asumsi 200 kata/menit). */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Potong teks menjadi ringkasan pendek.
 * Markdown marker dibuang agar hasil tampil polos di kartu.
 */
export function excerpt(markdown: string, maxLength = 160): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;

  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}
