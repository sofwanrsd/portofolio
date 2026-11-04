import { describe, expect, it } from "vitest";
import { MAX_LIMIT, filterPosts, filterProjects, parseLimit } from "./api-filters";

const q = (s: string) => new URLSearchParams(s);

const projects = [
  { slug: "a", category: "web" },
  { slug: "b", category: "ai" },
  { slug: "c", category: "web" },
];
const posts = [
  { slug: "x", tags: ["Next.js", "Vercel"] },
  { slug: "y", tags: ["Database"] },
  { slug: "z", tags: ["next.js"] },
];

describe("parseLimit", () => {
  it("menerima bilangan bulat positif", () => {
    expect(parseLimit("3")).toBe(3);
  });
  it("membatasi ke MAX_LIMIT", () => {
    expect(parseLimit("9999")).toBe(MAX_LIMIT);
  });
  it("mengabaikan nilai tidak valid", () => {
    for (const bad of [null, "", "0", "-2", "abc", "2.5", "1e3", " "]) {
      expect(parseLimit(bad)).toBeNull();
    }
  });
});

describe("filterProjects", () => {
  it("tanpa parameter mengembalikan semua", () => {
    expect(filterProjects(projects, q(""))).toHaveLength(3);
  });
  it("menyaring kategori tanpa peduli huruf besar", () => {
    expect(filterProjects(projects, q("category=WEB")).map((p) => p.slug)).toEqual(["a", "c"]);
  });
  it("kategori tidak dikenal menghasilkan daftar kosong", () => {
    expect(filterProjects(projects, q("category=game"))).toEqual([]);
  });
  it("menggabungkan kategori dan limit", () => {
    expect(filterProjects(projects, q("category=web&limit=1")).map((p) => p.slug)).toEqual(["a"]);
  });
  it("limit tidak valid diabaikan", () => {
    expect(filterProjects(projects, q("limit=abc"))).toHaveLength(3);
  });
});

describe("filterPosts", () => {
  it("menyaring tag tanpa peduli huruf besar", () => {
    expect(filterPosts(posts, q("tag=NEXT.JS")).map((p) => p.slug)).toEqual(["x", "z"]);
  });
  it("menggabungkan tag dan limit", () => {
    expect(filterPosts(posts, q("tag=next.js&limit=1")).map((p) => p.slug)).toEqual(["x"]);
  });
});
