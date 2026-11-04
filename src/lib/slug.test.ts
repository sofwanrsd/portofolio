import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("mengubah spasi dan kapital menjadi slug huruf kecil", () => {
    expect(slugify("Project Uji Otomatis")).toBe("project-uji-otomatis");
  });

  it("membuang aksen latin (NFD)", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });

  it("merapatkan simbol berulang menjadi satu tanda hubung", () => {
    expect(slugify("halo!!!   dunia")).toBe("halo-dunia");
    expect(slugify("a  --  b")).toBe("a-b");
  });

  it("tidak menyisakan tanda hubung di awal atau akhir", () => {
    expect(slugify("  --Halo Dunia--  ")).toBe("halo-dunia");
  });

  it("mengembalikan string kosong bila tidak ada karakter valid", () => {
    expect(slugify("")).toBe("");
    expect(slugify("!!!")).toBe("");
    // Teks non-latin (karakter Jepang) tidak menyisakan karakter valid.
    expect(slugify("\u65e5\u672c\u8a9e")).toBe("");
  });

  it("membatasi panjang maksimum 80 karakter tanpa tanda hubung menggantung", () => {
    const slug = slugify("a".repeat(120));
    expect(slug).toHaveLength(80);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("memotong di batas 80 karakter tanpa menyisakan tanda hubung di ujung", () => {
    // 79 karakter 'a' + spasi + 'b' -> pemotongan tepat setelah tanda hubung.
    const slug = slugify(`${"a".repeat(79)} b`);
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });
});
