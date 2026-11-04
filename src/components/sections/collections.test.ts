import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => createElement("a", null, children),
}));

const {
  CertificationSection,
  EducationSection,
  ExperienceSection,
  OrganizationSection,
} = await import("./collections");

import type { Experience } from "@/lib/types";

const base: Experience = {
  id: "",
  kind: "work",
  company: "Instansi",
  role: "Peran",
  start_date: "",
  end_date: "",
  period: "",
  description: "",
  highlights: [],
  url: "",
  sort_order: 0,
};

const work: Experience = {
  ...base,
  id: "w1",
  kind: "work",
  role: "Network Engineer",
  company: "PT Jaringan",
  start_date: "2026-02-01",
  description: "Mengelola jaringan kantor cabang.",
  highlights: ["Memasang 12 access point."],
};
const org: Experience = {
  ...base,
  id: "o1",
  kind: "organization",
  role: "Kepala Divisi",
  company: "HMIT",
  start_date: "2024-09-01",
  end_date: "2025-09-01",
  description: "Memimpin divisi teknologi.",
  highlights: ["Mengadakan pelatihan internal."],
};
const cert: Experience = {
  ...base,
  id: "c1",
  kind: "certification",
  role: "MTCNA",
  company: "MikroTik",
  start_date: "2023-06-01",
  end_date: "2023-06-01",
  description: "Nomor sertifikat: MTCNA-2023-0147. Sertifikasi dasar jaringan.",
  highlights: ["Lulus ujian praktik routing."],
};
const edu: Experience = {
  ...base,
  id: "e1",
  kind: "education",
  role: "S1 Teknik Informatika",
  company: "Universitas",
  start_date: "2020-09-01",
  end_date: "2024-08-01",
  description: "Fokus pada jaringan dan sistem terdistribusi.",
  highlights: ["Tugas akhir sistem monitoring."],
};

const render = (el: React.ReactElement) => renderToStaticMarkup(el);

describe("empat bagian riwayat terpisah", () => {
  it("organisasi dan sertifikasi tetap tampil walau tanpa pendidikan", () => {
    const html = [
      render(createElement(OrganizationSection, { experiences: [org] })),
      render(createElement(CertificationSection, { experiences: [cert] })),
    ].join("");
    expect(html).toContain('id="organization"');
    expect(html).toContain('id="certification"');
    expect(html).toContain("Kepala Divisi");
    expect(html).toContain("MTCNA");
  });

  it("bagian kosong tidak merender apa pun", () => {
    expect(render(createElement(OrganizationSection, { experiences: [work] }))).toBe("");
    expect(render(createElement(CertificationSection, { experiences: [edu] }))).toBe("");
  });

  it("kegiatan tidak lagi muncul di dalam kartu pendidikan", () => {
    const html = render(createElement(EducationSection, { experiences: [edu, org, cert] }));
    expect(html).not.toContain("HMIT");
    expect(html).not.toContain("MikroTik");
    expect(html).toContain("S1 Teknik Informatika");
  });

  it("pekerjaan menampilkan ringkasan dan poin", () => {
    const html = render(createElement(ExperienceSection, { experiences: [work] }));
    expect(html).toContain("Mengelola jaringan kantor cabang.");
    expect(html).toContain("Memasang 12 access point.");
    expect(html).toContain("Saat ini");
  });

  it("label Saat ini tidak muncul bila tanggal mulai kosong", () => {
    const tanpaTanggal: Experience = { ...work, id: "w2", start_date: "", end_date: "" };
    const html = render(createElement(ExperienceSection, { experiences: [tanpaTanggal] }));
    expect(html).not.toContain("Saat ini");
  });

  it("sertifikasi menampilkan tahun dan nomor dari data", () => {
    const html = render(createElement(CertificationSection, { experiences: [cert] }));
    expect(html).toContain("2023");
    expect(html).toContain("No. MTCNA-2023-0147");
    expect(html).toContain("Sertifikasi dasar jaringan.");
    expect(html).not.toContain("Nomor sertifikat:");
  });
});
