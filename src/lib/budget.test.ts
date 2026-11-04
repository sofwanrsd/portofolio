import { describe, expect, it } from "vitest";
import { BUDGET_OPTIONS, budgetFor } from "./budget";

describe("budgetFor", () => {
  it("memetakan harga paket seed ke rentang yang benar", () => {
    expect(budgetFor("2.500.000")).toBe("< 5 juta");
    expect(budgetFor("8.000.000")).toBe("5 - 15 juta");
    expect(budgetFor("25.000.000")).toBe("15 - 50 juta");
  });

  it("menangani batas rentang", () => {
    expect(budgetFor("4.999.999")).toBe("< 5 juta");
    expect(budgetFor("5.000.000")).toBe("5 - 15 juta");
    expect(budgetFor("15.000.000")).toBe("15 - 50 juta");
    expect(budgetFor("50.000.000")).toBe("15 - 50 juta");
    expect(budgetFor("50.000.001")).toBe("> 50 juta");
  });

  it("mengembalikan string kosong untuk nilai yang tidak valid", () => {
    expect(budgetFor("")).toBe("");
    expect(budgetFor(null)).toBe("");
    expect(budgetFor(undefined)).toBe("");
    expect(budgetFor("hubungi saya")).toBe("");
    expect(budgetFor("0")).toBe("");
  });

  it("selalu menghasilkan nilai yang ada di pilihan form", () => {
    for (const price of ["1.000.000", "9.000.000", "30.000.000", "99.000.000"]) {
      expect(BUDGET_OPTIONS).toContain(budgetFor(price));
    }
  });
});
