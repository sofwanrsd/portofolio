import { describe, expect, it } from "vitest";
import { excerpt, formatDate, formatDateTime, formatPrice, parseAmount, readingTime } from "@/lib/format";

describe("formatDate", () => {
  it("memformat tanggal panjang bahasa Indonesia", () => {
    expect(formatDate("2026-11-04T10:00:00Z")).toContain("November 2026");
  });

  it("mengembalikan string kosong untuk nilai kosong", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("")).toBe("");
  });

  it("mengembalikan string kosong untuk tanggal tidak valid", () => {
    expect(formatDate("bukan-tanggal")).toBe("");
  });
});

describe("formatDateTime", () => {
  it("menyertakan jam dan menit", () => {
    const out = formatDateTime("2026-11-04T10:30:00Z");
    expect(out).toContain("2026");
    expect(out).toMatch(/\d{2}[.:]\d{2}/);
  });

  it("aman untuk nilai kosong", () => {
    expect(formatDateTime(null)).toBe("");
  });
});

describe("parseAmount", () => {
  it("membaca angka polos", () => {
    expect(parseAmount("2500000")).toBe(2500000);
  });

  it("membaca pemisah ribuan titik (gaya Indonesia)", () => {
    expect(parseAmount("2.500.000")).toBe(2500000);
  });

  it("membaca pemisah ribuan koma (gaya Inggris)", () => {
    expect(parseAmount("2,500,000")).toBe(2500000);
  });

  it("membaca desimal gaya Indonesia", () => {
    expect(parseAmount("2.500.000,50")).toBe(2500000.5);
  });

  it("membaca desimal gaya Inggris", () => {
    expect(parseAmount("2500000.5")).toBe(2500000.5);
  });

  it("mengembalikan null bila tidak ada angka", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("hubungi saya")).toBeNull();
  });
});

describe("formatPrice", () => {
  it("memberi simbol Rp untuk IDR, termasuk input bertitik", () => {
    expect(formatPrice("2500000", "IDR")).toBe("Rp2.500.000");
    expect(formatPrice("2.500.000", "IDR")).toBe("Rp2.500.000");
  });

  it("memberi simbol $ untuk USD", () => {
    expect(formatPrice("1500", "USD")).toBe("$1,500");
  });

  it("memberi prefix kode untuk mata uang lain", () => {
    expect(formatPrice("1000", "SGD")).toBe("SGD 1,000");
  });

  it("mengembalikan nilai apa adanya bila bukan angka atau nol", () => {
    expect(formatPrice("", "IDR")).toBe("");
    expect(formatPrice("gratis", "IDR")).toBe("gratis");
    expect(formatPrice("0", "IDR")).toBe("0");
  });
});

describe("readingTime", () => {
  it("minimum satu menit walau teks sangat pendek", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("dua kata")).toBe(1);
  });

  it("menghitung 200 kata per menit", () => {
    expect(readingTime(Array.from({ length: 200 }, () => "kata").join(" "))).toBe(1);
    expect(readingTime(Array.from({ length: 600 }, () => "kata").join(" "))).toBe(3);
  });
});

describe("excerpt", () => {
  it("membuang penanda markdown", () => {
    expect(excerpt("## Judul\n\n**tebal** dan _miring_")).toBe("Judul tebal dan miring");
  });

  it("membuang tautan dan gambar menjadi teks biasa", () => {
    expect(excerpt("Lihat [dokumentasi](https://example.com) sekarang")).toBe(
      "Lihat dokumentasi sekarang",
    );
    expect(excerpt("![gambar](https://example.com/a.png) sesudah")).toBe("sesudah");
  });

  it("memotong teks panjang dan menambahkan elipsis", () => {
    const long = Array.from({ length: 80 }, () => "kata").join(" ");
    const out = excerpt(long, 40);
    expect(out.endsWith("...")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(43);
  });

  it("tidak menambah elipsis bila sudah pendek", () => {
    expect(excerpt("Teks pendek", 40)).toBe("Teks pendek");
  });
});
