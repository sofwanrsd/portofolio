import { describe, expect, it } from "vitest";
import { brandMark } from "./brand";

describe("brandMark", () => {
  it("memakai teks logo yang diisi admin", () => {
    expect(brandMark({ name: "Sofwan Rosidi", logoText: "SR" })).toBe("SR");
    expect(brandMark({ name: "Sofwan Rosidi", logoText: " sr " })).toBe("SR");
  });
  it("mengambil inisial nama bila teks logo kosong", () => {
    expect(brandMark({ name: "Sofwan Rosidi", logoText: "" })).toBe("SR");
    expect(brandMark({ name: "Sofwan", logoText: "" })).toBe("SO");
  });
  it("membatasi dua huruf agar tetap muat di kotak ikon", () => {
    expect(brandMark({ name: "Sofwan Rosidi", logoText: "ABC" })).toBe("AB");
  });
  it("memberi tanda pengganti saat nama belum diisi", () => {
    expect(brandMark({ name: "", logoText: "" })).toBe("P");
  });
});
