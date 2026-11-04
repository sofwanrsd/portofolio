"use client";

/**
 * Error terakhir sebelum root layout gagal. Minimal HTML, tetap 500.
 * Wajib menyertakan <html> dan <body> sendiri karena root layout tidak dirender.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0f",
          color: "#f4f4f5",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
            Aplikasi gagal dimuat
          </h1>
          <p style={{ marginTop: "0.75rem", opacity: 0.7, fontSize: "0.9rem" }}>
            Terjadi kesalahan fatal. Silakan muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.6rem 1.1rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#f4f4f5",
              color: "#0b0b0f",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Muat ulang
          </button>
        </div>
      </body>
    </html>
  );
}
