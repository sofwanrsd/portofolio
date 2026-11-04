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
  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM experiences
      ORDER BY (start_date = '') ASC, start_date DESC, sort_order ASC`
  );
  return rows.map((row) => ({
    ...(row as unknown as Experience),
    kind: (row.kind as Experience["kind"]) || "work",
    start_date: String(row.start_date ?? ""),
    end_date: String(row.end_date ?? ""),
    highlights: toStringArray(row.highlights),
  }));
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


/** Data ringkasan untuk dashboard admin: status konten dan aktivitas pesan. */
export async function getAdminOverview() {
  const content = await query<{ kind: string; published: string; draft: string }>(
    `SELECT 'Project' AS kind, count(*) FILTER (WHERE published) AS published, count(*) FILTER (WHERE NOT published) AS draft FROM projects
     UNION ALL SELECT 'Artikel', count(*) FILTER (WHERE published), count(*) FILTER (WHERE NOT published) FROM posts
     UNION ALL SELECT 'Layanan', count(*) FILTER (WHERE published), count(*) FILTER (WHERE NOT published) FROM services
     UNION ALL SELECT 'Testimoni', count(*) FILTER (WHERE published), count(*) FILTER (WHERE NOT published) FROM testimonials`
  );

  // 14 hari terakhir, termasuk hari tanpa pesan (nilai 0), zona waktu Jakarta.
  const daily = await query<{ day: string; total: string }>(
    `SELECT to_char(d, 'YYYY-MM-DD') AS day,
            (SELECT count(*) FROM messages m
              WHERE (m.created_at AT TIME ZONE 'Asia/Jakarta')::date = d) AS total
       FROM generate_series(
              (now() AT TIME ZONE 'Asia/Jakarta')::date - 13,
              (now() AT TIME ZONE 'Asia/Jakarta')::date,
              interval '1 day') AS d
      ORDER BY d`
  );

  const extra = await queryOne<{ skills: string; experiences: string; featured: string }>(
    `SELECT (SELECT count(*) FROM skills) AS skills,
            (SELECT count(*) FROM experiences) AS experiences,
            (SELECT count(*) FROM projects WHERE featured AND published) AS featured`
  );

  return {
    content: content.map((c) => ({
      kind: c.kind,
      published: Number(c.published),
      draft: Number(c.draft),
    })),
    daily: daily.map((d) => ({ day: d.day, total: Number(d.total) })),
    skills: Number(extra?.skills ?? 0),
    experiences: Number(extra?.experiences ?? 0),
    featured: Number(extra?.featured ?? 0),
  };
}
