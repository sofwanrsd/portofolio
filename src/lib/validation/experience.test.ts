import { describe, expect, it } from "vitest";
import { experienceSchema } from "./experience";

const base = { role: "Teknisi jaringan", company: "Instansi" };

describe("experienceSchema", () => {
  it("menerima poin kegiatan sebagai teks per baris", () => {
    const data = experienceSchema.parse({ ...base, highlights: "- Konfigurasi router\n\n* Perawatan perangkat" });
    expect(data.highlights).toEqual(["Konfigurasi router", "Perawatan perangkat"]);
  });
  it("menolak tanggal yang tidak benar", () => {
    for (const start_date of ["2024-13-01", "2024-00", "2025-02-29", "2024-04-31"]) {
      expect(experienceSchema.safeParse({ ...base, start_date }).success, start_date).toBe(false);
    }
  });
  it("menerima tanggal kabisat, bulan saja, dan tanggal kosong", () => {
    for (const start_date of ["2024-02-29", "2025-02", ""]) {
      expect(experienceSchema.safeParse({ ...base, start_date }).success, start_date).toBe(true);
    }
  });
  it("menolak tanggal akhir sebelum mulai", () => {
    expect(experienceSchema.safeParse({ ...base, start_date: "2025-01-01", end_date: "2024-12-01" }).success).toBe(false);
  });
  it("menolak jenis riwayat yang tidak dikenal", () => {
    expect(experienceSchema.safeParse({ ...base, kind: "invalid" }).success).toBe(false);
  });
});
