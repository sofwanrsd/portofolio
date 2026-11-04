/**
 * Tanda merek dua huruf untuk ikon situs dan kartu pratinjau.
 * Teks logo dari admin selalu menang; bila kosong dipakai inisial nama.
 */
export function brandMark(site: { name: string; logoText?: string }): string {
  const custom = (site.logoText ?? "").trim();
  if (custom) return custom.slice(0, 2).toUpperCase();

  const initials = site.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Nama satu kata: dua huruf pertamanya, sama seperti header dan footer.
  if (initials.length < 2) return site.name.trim().slice(0, 2).toUpperCase() || "P";
  return initials;
}
