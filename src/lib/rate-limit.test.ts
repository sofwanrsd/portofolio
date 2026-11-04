import { afterEach, describe, expect, it, vi } from "vitest";
import { consume, peek, reset, sweep } from "@/lib/rate-limit";

const KEY = "uji|rate-limit";

afterEach(() => {
  reset(KEY);
  vi.useRealTimers();
});

describe("consume", () => {
  it("mengizinkan permintaan sampai batas tercapai", () => {
    const first = consume(KEY, { limit: 3, windowMs: 1000 });
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);

    const second = consume(KEY, { limit: 3, windowMs: 1000 });
    expect(second.remaining).toBe(1);

    const third = consume(KEY, { limit: 3, windowMs: 1000 });
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    const fourth = consume(KEY, { limit: 3, windowMs: 1000 });
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("menolak tanpa memperpanjang jendela (hit yang ditolak tidak dicatat)", () => {
    for (let i = 0; i < 5; i += 1) consume(KEY, { limit: 5, windowMs: 1000 });
    const denied = consume(KEY, { limit: 5, windowMs: 1000 });
    expect(denied.allowed).toBe(false);
    // Bucket tetap berisi 5 hit, bukan 6.
    expect(peek(KEY, { limit: 5, windowMs: 1000 }).remaining).toBe(0);
  });

  it("mengizinkan lagi setelah jendela bergeser", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T00:00:00Z"));

    consume(KEY, { limit: 1, windowMs: 1000 });
    expect(consume(KEY, { limit: 1, windowMs: 1000 }).allowed).toBe(false);

    vi.setSystemTime(new Date("2026-11-04T00:00:02Z"));
    expect(consume(KEY, { limit: 1, windowMs: 1000 }).allowed).toBe(true);
  });

  it("memisahkan kuota antar kunci", () => {
    consume("ip-a|email", { limit: 1, windowMs: 1000 });
    expect(consume("ip-b|email", { limit: 1, windowMs: 1000 }).allowed).toBe(true);
    reset("ip-a|email");
    reset("ip-b|email");
  });
});

describe("peek", () => {
  it("tidak menambah hit", () => {
    consume(KEY, { limit: 2, windowMs: 1000 });
    expect(peek(KEY, { limit: 2, windowMs: 1000 }).remaining).toBe(1);
    expect(peek(KEY, { limit: 2, windowMs: 1000 }).remaining).toBe(1);
  });

  it("mengembalikan kuota penuh untuk kunci yang belum pernah dipakai", () => {
    expect(peek("kunci-baru", { limit: 4, windowMs: 1000 })).toMatchObject({
      allowed: true,
      remaining: 4,
    });
  });
});

describe("reset dan sweep", () => {
  it("reset menghapus seluruh riwayat kunci", () => {
    consume(KEY, { limit: 1, windowMs: 1000 });
    expect(consume(KEY, { limit: 1, windowMs: 1000 }).allowed).toBe(false);
    reset(KEY);
    expect(consume(KEY, { limit: 1, windowMs: 1000 }).allowed).toBe(true);
  });

  it("sweep membuang bucket kedaluwarsa tanpa mengganggu yang masih aktif", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-04T00:00:00Z"));
    consume("lama", { limit: 5, windowMs: 1000 });
    consume(KEY, { limit: 5, windowMs: 1000 });

    vi.setSystemTime(new Date("2026-11-04T00:00:00.600Z"));
    consume(KEY, { limit: 5, windowMs: 1000 });

    vi.setSystemTime(new Date("2026-11-04T00:00:02Z"));
    sweep(1000);

    // Bucket lama hilang -> boleh dipakai lagi; bucket aktif tersisa 0 hit.
    expect(peek("lama", { limit: 5, windowMs: 1000 }).remaining).toBe(5);
    reset("lama");
  });
});
