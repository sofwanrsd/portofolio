import { afterEach, describe, expect, it } from "vitest";
import { RATE_LIMIT_MAX, rateLimitKey, submitContact } from "@/lib/contact";
import { reset } from "@/lib/rate-limit";

const IP = "10.0.0.9";
const EMAIL = "dewi@contoh.com";

const payload = {
  name: "Dewi Lestari",
  email: EMAIL,
  subject: "Landing page",
  budget: "Rp5-10 juta",
  message: "Saya butuh landing page untuk peluncuran produk bulan depan.",
};

afterEach(() => {
  reset(rateLimitKey(IP, EMAIL));
});

describe("rateLimitKey", () => {
  it("mencampur IP dan email, dinormalisasi huruf kecil", () => {
    expect(rateLimitKey("1.2.3.4", "A@B.com")).toBe("1.2.3.4|a@b.com");
  });

  it("memakai penanda unknown bila IP tidak tersedia", () => {
    expect(rateLimitKey(null, "a@b.com")).toBe("unknown|a@b.com");
  });
});

describe("submitContact - validasi", () => {
  it("menolak payload tidak valid tanpa menyentuh database", async () => {
    const result = await submitContact({ ...payload, email: "salah" }, IP);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors?.email).toContain("Email tidak valid");
      expect(result.rateLimited).toBeUndefined();
    }
  });

  it("mengembalikan pesan ramah untuk isian kosong", async () => {
    const result = await submitContact({}, IP);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("Periksa kembali");
  });
});

describe("submitContact - rate limit", () => {
  it("menolak permintaan ke-(max+1) dengan flag rateLimited", async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      await submitContact(payload, IP);
    }

    const blocked = await submitContact(payload, IP);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.rateLimited).toBe(true);
      expect(blocked.rateLimit?.allowed).toBe(false);
      expect(blocked.message).toContain("Terlalu banyak");
    }
  });

  it("kuota dipisah per IP", async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i += 1) {
      await submitContact(payload, IP);
    }
    const otherIp = await submitContact(payload, "10.0.0.10");
    expect(otherIp.rateLimit?.allowed).toBe(true);
    reset(rateLimitKey("10.0.0.10", EMAIL));
  });
});
