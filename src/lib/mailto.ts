// Utilitas mailto murni: membangun Tautan_Mailto yang teralamat ke email
// Pemilik (Req 6.1). Bebas efek samping agar dapat diuji dengan
// property-based testing (lihat Property 16).

/** Deskriptor tautan mailto: href untuk anchor dan label yang ditampilkan. */
export interface MailtoLink {
  /** Nilai atribut href, tepat `"mailto:" + email`. */
  href: string;
  /** Teks yang ditampilkan, yaitu alamat email itu sendiri. */
  label: string;
}

/**
 * Menghasilkan `href` mailto yang tepat sama dengan `"mailto:" + email`
 * (Property 16 — Req 6.1).
 */
export function buildMailtoHref(email: string): string {
  return 'mailto:' + email;
}

/**
 * Menghasilkan deskriptor Tautan_Mailto lengkap: `href` `"mailto:" + email`
 * dan `label` yang menampilkan alamat email tersebut (Req 6.1).
 */
export function buildMailtoLink(email: string): MailtoLink {
  return { href: buildMailtoHref(email), label: email };
}
