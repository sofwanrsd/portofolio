/**
 * Wrapper terpusat untuk invalidasi cache Next.js.
 * Setiap mutasi admin memanggil helper ini agar halaman publik ikut segar.
 * Di dokumentasikan pada PROJECT/04-ARCHITECTURE/system-architecture.md §4.2.
 */

import { revalidatePath } from "next/cache";

/**
 * Peta entitas -> path publik yang bergantung padanya.
 * Dipakai `revalidatePublic()` agar daftar path tidak tersebar di tiap action.
 */
const PUBLIC_PATHS: Record<string, string[]> = {
  projects: ["/", "/projects"],
  posts: ["/", "/blog"],
  services: ["/", "/services"],
  experience: ["/", "/about"],
  skills: ["/", "/about"],
  testimonials: ["/"],
  settings: ["/", "/about", "/services", "/contact"],
  messages: ["/admin/messages"],
};

/** Path publik yang di-refresh saat sebuah entitas berubah. */
export function publicPathsFor(key: string): string[] {
  return PUBLIC_PATHS[key] ?? ["/"];
}

/**
 * Refresh path publik + halaman daftar admin untuk sebuah entitas.
 * Aman dipanggil berulang; Next.js hanya melakukan render ulang seperlunya.
 */
export function revalidateResource(key: string): void {
  for (const path of publicPathsFor(key)) {
    revalidatePath(path);
  }
  revalidatePath(`/admin/${key}`);
}

/**
 * Refresh seluruh layout publik: dipakai saat pengaturan situs berubah,
 * karena tema, warna, dan section impacting seluruh halaman.
 */
export function revalidateSite(): void {
  revalidatePath("/", "layout");
}
