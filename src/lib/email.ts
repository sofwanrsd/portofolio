/**
 * Modul notifikasi email (Resend).
 * Kegagalan sending di sini TIDAK boleh menggagalkan operasi utama —
 * pesan kontak sudah tersimpan di database sebelum email dikirim.
 * Di dokumentasikan pada PROJECT/04-ARCHITECTURE/system-architecture.md §4.2 dan failure mode F4.
 */

export type InquiryPayload = {
  name: string;
  email: string;
  subject?: string;
  budget?: string;
  message: string;
};

/** Escape karakter HTML agar input pengguna tidak disisipkan mentah ke email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Kirim email notifikasi inquiry baru.
 * Best-effort: bila env belum di-set atau API gagal, hanya di-log sebagai warning.
 * @returns true bila email benar-benar terkirim.
 */
export async function sendInquiryNotification(
  payload: InquiryPayload
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.warn(
      "[email] RESEND_API_KEY/CONTACT_TO_EMAIL/CONTACT_FROM_EMAIL belum di-set — notifikasi dilewati."
    );
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Portfolio] Inquiry baru dari ${payload.name}${
          payload.subject ? ` — ${payload.subject}` : ""
        }`,
        html: `
          <h2>Inquiry baru dari form kontak</h2>
          <p><strong>Nama:</strong> ${escapeHtml(payload.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p><strong>Budget:</strong> ${escapeHtml(payload.budget ?? "-")}</p>
          <p><strong>Subjek:</strong> ${escapeHtml(payload.subject ?? "-")}</p>
          <hr />
          <p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>
        `.trim(),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `[email] Resend menolak request (${response.status}): ${body.slice(0, 200)}`
      );
      return false;
    }

    return true;
  } catch (error) {
    // Notifikasi email bersifat best-effort; pesan tetap tersimpan di database.
    console.error("[email] gagal mengirim notifikasi:", (error as Error).message);
    return false;
  }
}
