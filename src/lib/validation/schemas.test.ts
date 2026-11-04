import { describe, expect, it } from "vitest";
import { postSchema, projectSchema, serviceSchema, messageSchema, slugSchema } from "@/lib/validation";

const validProject = {
  title: "Dashboard Analytics",
  summary: "Dashboard real-time dengan chart interaktif.",
  category: "web",
};

const validPost = {
  title: "Cara Deploy Next.js",
  excerpt: "Panduan ringkas dari repo kosong sampai URL publik.",
  content: "## Langkah\n\n1. Push repo ke GitHub\n2. Import di Vercel",
};

describe("projectSchema", () => {
  it("menerima payload minimal dan mengisi default", () => {
    const parsed = projectSchema.parse(validProject);
    expect(parsed.stack).toEqual([]);
    expect(parsed.gallery).toEqual([]);
    expect(parsed.published).toBe(true);
    expect(parsed.sort_order).toBe(0);
  });

  it("menolak judul terlalu pendek", () => {
    const result = projectSchema.safeParse({ ...validProject, title: "ab" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("minimal 3");
  });

  it("menolak kategori di luar enum", () => {
    expect(projectSchema.safeParse({ ...validProject, category: "game" }).success).toBe(false);
  });

  it("memecah stack dari string multi-baris", () => {
    const parsed = projectSchema.parse({ ...validProject, stack: "Next.js\nReact\n  Neon  " });
    expect(parsed.stack).toEqual(["Next.js", "React", "Neon"]);
  });

  it("menolak URL gallery yang tidak valid", () => {
    expect(projectSchema.safeParse({ ...validProject, gallery: "bukan-url" }).success).toBe(false);
  });
});

describe("postSchema", () => {
  it("menerima artikel valid", () => {
    expect(postSchema.parse(validPost).tags).toEqual([]);
  });

  it("menolak isi artikel terlalu pendek", () => {
    expect(postSchema.safeParse({ ...validPost, content: "pendek" }).success).toBe(false);
  });

  it("memecah tag dari string multi-baris", () => {
    expect(postSchema.parse({ ...validPost, tags: "Next.js\nNeon" }).tags).toEqual(["Next.js", "Neon"]);
  });
});

describe("serviceSchema", () => {
  const validService = {
    title: "Landing Page",
    description: "Satu halaman yang persuasive dan converting.",
  };

  it("menerima layanan valid dengan default IDR dan ikon rocket", () => {
    const parsed = serviceSchema.parse(validService);
    expect(parsed.currency).toBe("IDR");
    expect(parsed.icon).toBe("rocket");
    expect(parsed.features).toEqual([]);
  });

  it("menolak mata uang tak dikenal", () => {
    expect(serviceSchema.safeParse({ ...validService, currency: "GBP" }).success).toBe(false);
  });
});

describe("messageSchema", () => {
  const valid = {
    name: "Dewi Lestari",
    email: "dewi@contoh.com",
    message: "Saya butuh landing page untuk peluncuran produk.",
  };

  it("menerima pesan valid dan mengisi subject/budget kosong", () => {
    const parsed = messageSchema.parse(valid);
    expect(parsed.subject).toBe("");
    expect(parsed.budget).toBe("");
  });

  it("menolak email tidak valid", () => {
    const result = messageSchema.safeParse({ ...valid, email: "bukan-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Email tidak valid");
  });

  it("menolak pesan kurang dari 10 karakter", () => {
    expect(messageSchema.safeParse({ ...valid, message: "halo" }).success).toBe(false);
  });

  it("menolak kiriman bot yang mengisi honeypot", () => {
    const result = messageSchema.safeParse({ ...valid, website: "https://spam.example" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("Spam");
  });

  it("menerima honeypot kosong", () => {
    expect(messageSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });
});

describe("slugSchema", () => {
  it("menerima slug huruf kecil, angka, dan tanda hubung", () => {
    expect(slugSchema.parse("project-uji-2026")).toBe("project-uji-2026");
  });

  it("menolak huruf kapital dan spasi", () => {
    expect(slugSchema.safeParse("Project Uji").success).toBe(false);
  });

  it("menerima string kosong (slug opsional)", () => {
    expect(slugSchema.parse("")).toBe("");
  });
});
