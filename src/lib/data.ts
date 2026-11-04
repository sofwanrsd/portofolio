import { query, queryOne, toStringArray } from "./db";
import type {
  Experience,
  Message,
  Post,
  Project,
  Service,
  Skill,
  Testimonial,
} from "./types";

function mapProject(row: Record<string, unknown>): Project {
  return {
    ...(row as unknown as Project),
    gallery: toStringArray(row.gallery),
    stack: toStringArray(row.stack),
  };
}

function mapPost(row: Record<string, unknown>): Post {
  return {
    ...(row as unknown as Post),
    tags: toStringArray(row.tags),
  };
}

function mapService(row: Record<string, unknown>): Service {
  return {
    ...(row as unknown as Service),
    features: toStringArray(row.features),
  };
}

export async function getProjects(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Project[]> {
  const where = options?.featuredOnly ? "WHERE published = true AND featured = true" : "WHERE published = true";
  const limit = options?.limit ? `LIMIT ${Number(options.limit)}` : "";
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM projects ${where} ORDER BY sort_order ASC, created_at DESC ${limit}`
  );
  return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const row = await queryOne<Record<string, unknown>>(
    "SELECT * FROM projects WHERE slug = $1 AND published = true LIMIT 1",
    [slug]
  );
  return row ? mapProject(row) : null;
}

export async function getAllProjects(): Promise<Project[]> {
  const rows = await query<Record<string, unknown>>(
    "SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"
  );
  return rows.map(mapProject);
}

export async function getPosts(options?: { limit?: number }): Promise<Post[]> {
  const limit = options?.limit ? `LIMIT ${Number(options.limit)}` : "";
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM posts WHERE published = true ORDER BY published_at DESC NULLS LAST, created_at DESC ${limit}`
  );
  return rows.map(mapPost);
}

export async function getAllPosts(): Promise<Post[]> {
  const rows = await query<Record<string, unknown>>(
    "SELECT * FROM posts ORDER BY published_at DESC NULLS LAST, created_at DESC"
  );
  return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const row = await queryOne<Record<string, unknown>>(
    "SELECT * FROM posts WHERE slug = $1 AND published = true LIMIT 1",
    [slug]
  );
  return row ? mapPost(row) : null;
}

export async function getServices(): Promise<Service[]> {
  const rows = await query<Record<string, unknown>>(
    "SELECT * FROM services WHERE published = true ORDER BY sort_order ASC, created_at DESC"
  );
  return rows.map(mapService);
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await query<Record<string, unknown>>(
    "SELECT * FROM services ORDER BY sort_order ASC, created_at DESC"
  );
  return rows.map(mapService);
}

export async function getExperiences(): Promise<Experience[]> {
  const rows = await query<Experience>(
    "SELECT * FROM experiences ORDER BY sort_order ASC"
  );
  return rows;
}

export async function getSkills(): Promise<Skill[]> {
  const rows = await query<Skill>("SELECT * FROM skills ORDER BY sort_order ASC");
  return rows;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await query<Testimonial>(
    "SELECT * FROM testimonials WHERE published = true ORDER BY sort_order ASC"
  );
  return rows;
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const rows = await query<Testimonial>(
    "SELECT * FROM testimonials ORDER BY sort_order ASC"
  );
  return rows;
}

export async function getMessages(): Promise<Message[]> {
  const rows = await query<Message>(
    "SELECT * FROM messages ORDER BY created_at DESC"
  );
  return rows;
}

export async function getDashboardStats() {
  const row = await queryOne<{
    projects: string;
    posts: string;
    services: string;
    messages: string;
    new_messages: string;
  }>(
    `SELECT
       (SELECT count(*) FROM projects) AS projects,
       (SELECT count(*) FROM posts) AS posts,
       (SELECT count(*) FROM services) AS services,
       (SELECT count(*) FROM messages) AS messages,
       (SELECT count(*) FROM messages WHERE status = 'new') AS new_messages`
  );

  return {
    projects: Number(row?.projects ?? 0),
    posts: Number(row?.posts ?? 0),
    services: Number(row?.services ?? 0),
    messages: Number(row?.messages ?? 0),
    newMessages: Number(row?.new_messages ?? 0),
  };
}
