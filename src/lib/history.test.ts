import { describe, expect, it } from "vitest";
import {
  certificateMeta,
  formatMonth,
  formatPeriod,
  isOngoing,
  splitHistory,
} from "./history";
import type { Experience } from "./types";

const base: Experience = {
  id: "",
  kind: "work",
  company: "X",
  role: "Y",
  start_date: "",
  end_date: "",
  period: "",
  description: "",
  highlights: [],
  url: "",
  sort_order: 0,
};
const e = (over: Partial<Experience>): Experience => ({
  ...base,
  id: Math.random().toString(36),
  ...over,
});

describe("formatMonth", () => {
  it("memformat bulan dan tahun", () => {
    expect(formatMonth("2026-02-01")).toBe("Feb 2026");
    expect(formatMonth("2024-09")).toBe("Sep 2024");
    expect(formatMonth("2023")).toBe("2023");
    expect(formatMonth("")).toBe("");
  });
});

describe("formatPeriod", () => {
  it("periode manual selalu menang", () => {
    expect(formatPeriod({ period: "2023", start_date: "2020-01", end_date: "" })).toBe("2023");
  });
  it("dibentuk dari tanggal", () => {
    expect(formatPeriod({ period: "", start_date: "2026-02-01", end_date: "" })).toBe("Feb 2026 sampai sekarang");
    expect(formatPeriod({ period: "", start_date: "2024-09-01", end_date: "2025-01-01" })).toBe("Sep 2024 sampai Jan 2025");
    expect(formatPeriod({ period: "", start_date: "2023-05", end_date: "2023-05" })).toBe("Mei 2023");
    expect(formatPeriod({ period: "", start_date: "", end_date: "" })).toBe("");
  });
});

describe("isOngoing", () => {
  it("butuh tanggal mulai, bukan sekadar tanggal selesai kosong", () => {
    expect(isOngoing({ start_date: "2026-02-01", end_date: "", period: "" })).toBe(true);
    expect(isOngoing({ start_date: "", end_date: "", period: "" })).toBe(false);
    expect(isOngoing({ start_date: "", end_date: "", period: "Sejak 2020" })).toBe(false);
  });
  it("selesai atau periode manual berarti tidak berlangsung", () => {
    expect(isOngoing({ start_date: "2020-01", end_date: "2021-01", period: "" })).toBe(false);
    expect(isOngoing({ start_date: "2020-01", end_date: "", period: "2020 sampai 2021" })).toBe(false);
  });
});

describe("splitHistory", () => {
  const kerja = e({ kind: "work", role: "Asisten" });
  const kuliah = e({ kind: "education", role: "S1" });
  const smk = e({ kind: "education", role: "SMK" });
  const hmit = e({ kind: "organization", role: "HMIT" });
  const mtcna = e({ kind: "certification", role: "MTCNA" });

  it("memisahkan empat jenis riwayat ke ember masing-masing", () => {
    const g = splitHistory([kerja, kuliah, hmit, mtcna, smk]);
    expect(g.work.map((x) => x.role)).toEqual(["Asisten"]);
    expect(g.education.map((x) => x.role)).toEqual(["S1", "SMK"]);
    expect(g.organization.map((x) => x.role)).toEqual(["HMIT"]);
    expect(g.certification.map((x) => x.role)).toEqual(["MTCNA"]);
  });

  it("kegiatan tidak lagi ditempelkan ke jenjang pendidikan", () => {
    const g = splitHistory([kuliah, hmit]);
    expect(g.organization).toHaveLength(1);
    expect(g.education).toHaveLength(1);
    expect(g).not.toHaveProperty("others");
  });

  it("urutan masukan dipertahankan dan daftar kosong aman", () => {
    expect(splitHistory([hmit, kerja]).organization[0].role).toBe("HMIT");
    expect(splitHistory([])).toEqual({
      work: [],
      education: [],
      organization: [],
      certification: [],
    });
  });

  it("baris lama tanpa kind dianggap pekerjaan", () => {
    const legacy = e({ kind: undefined as unknown as Experience["kind"], role: "Lama" });
    expect(splitHistory([legacy]).work.map((x) => x.role)).toEqual(["Lama"]);
  });
});

describe("certificateMeta", () => {
  it("tahun dari periode manual atau tanggal", () => {
    expect(certificateMeta(e({ period: "2018" })).year).toBe("2018");
    expect(certificateMeta(e({ period: "", start_date: "2019-04-01" })).year).toBe("2019");
    expect(certificateMeta(e({ period: "Juni 2020", start_date: "2019-04-01" })).year).toBe("2020");
    expect(certificateMeta(e({})).year).toBe("");
  });

  it("nomor sertifikat dibaca dari kolom tambahan bila ada", () => {
    const row = { ...e({ role: "MTCNA" }), cert_number: "  MTCNA-2023-0147 " };
    expect(certificateMeta(row as Experience).number).toBe("MTCNA-2023-0147");
  });

  it("nomor sertifikat bisa diambil dari deskripsi", () => {
    expect(
      certificateMeta(e({ description: "Nomor sertifikat: DC-1123-8891. Lulus dengan predikat baik." })).number
    ).toBe("DC-1123-8891");
  });

  it("tanpa nomor tidak mengarang apa pun", () => {
    expect(certificateMeta(e({ description: "Sertifikat kelulusan kelas online." })).number).toBe("");
  });
});

describe("certificateMeta description cleanup", () => {
  it("deskripsi tanpa nomor dikembalikan apa adanya", () => {
    expect(certificateMeta(e({ description: "Kelas online." })).description).toBe("Kelas online.");
  });
  it("label nomor dibuang dari deskripsi agar tidak tampil dua kali", () => {
    expect(
      certificateMeta(e({ description: "Nomor: ABC-123. Fokus pada backend." })).description
    ).toBe("Fokus pada backend.");
  });
});
