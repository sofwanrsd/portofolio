"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { execute, query, queryOne } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";
import { revalidateResource, revalidateSite } from "@/lib/revalidate";
import { saveSettings as saveSettingsValues } from "@/lib/settings";
import {
  projectSchema,
  postSchema,
  serviceSchema,
  experienceSchema,
  skillSchema,
  testimonialSchema,
} from "@/lib/validation";
import {
  getResource,
  type ResourceDef,
  type FieldSchema,
} from "@/lib/resources";

export type ActionResult = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};


/* ------------------------------------------------------------------ *
 *  Resource definitions: satu engine CRUD untuk semua entitas
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 *  Validation & coercion
 * ------------------------------------------------------------------ */

const JSONB_FIELDS = new Set(["gallery", "stack", "tags", "features"]);

function coerceValue(field: FieldSchema, raw: string | undefined): unknown {
  const value = (raw ?? "").trim();

  switch (field.type) {
    case "number":
      return value === "" ? 0 : Number(value);
    case "boolean":
      return value === "true" || value === "on" || value === "1";
    case "tags":
    case "list":
      return value
        ? value
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean)
        : [];
    default:
      return value;
  }
}

/**
 * Peta resource -> skema Zod. Validasi laps pertama (wajib diisi, tipe dasar)
 * tetap memakai definisi field; skema Zod menambah aturan domain
 * (batas panjang, enum kategori, format URL, dan sejenisnya).
 */
const SCHEMAS: Record<string, z.ZodTypeAny> = {
  projects: projectSchema,
  posts: postSchema,
  services: serviceSchema,
  experiences: experienceSchema,
  skills: skillSchema,
  testimonials: testimonialSchema,
};

function validate(
  resource: ResourceDef,
  values: Record<string, unknown>
): { ok: true; data: Record<string, unknown> } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};

  for (const field of resource.fields) {
    const raw = values[field.name];
    const coerced = coerceValue(field, typeof raw === "string" ? raw : undefined);

    if (field.required) {
      const isEmpty =
        coerced === "" ||
        coerced === undefined ||
        coerced === null ||
        (Array.isArray(coerced) && coerced.length === 0);
      if (isEmpty) {
        errors[field.name] = `${field.label} wajib diisi.`;
        continue;
      }
    }

    if (field.type === "number") {
      const num = Number(coerced);
      if (Number.isNaN(num)) {
        errors[field.name] = `${field.label} harus berupa angka.`;
        continue;
      }
      data[field.name] = num;
      continue;
    }

    if (field.type === "boolean") {
      data[field.name] = Boolean(coerced);
      continue;
    }

    if (field.type === "tags" || field.type === "list") {
      data[field.name] = coerced;
      continue;
    }

    data[field.name] = String(coerced ?? "");
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // Validasi domain tambahan lewat skema Zod per entitas.
  const schema = SCHEMAS[resource.table];
  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      if (Object.keys(errors).length > 0) return { ok: false, errors };
    }
  }

  return { ok: true, data };
}

/* ------------------------------------------------------------------ *
 *  CRUD actions
 * ------------------------------------------------------------------ */

export async function createResource(
  key: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return { ok: false, message: "Resource tidak dikenal." };

  const raw: Record<string, string | undefined> = {};
  for (const field of resource.fields) {
    const value = formData.get(field.name);
    raw[field.name] = typeof value === "string" ? value : undefined;
  }

  const validated = validate(resource, raw);
  if (!validated.ok) {
    return {
      ok: false,
      message: "Periksa kembali isian formulir.",
      errors: validated.errors,
    };
  }

  const data = validated.data;

  // Generate slug bila kosong, lalu pastikan unik terhadap data yang ada.
  if (resource.hasSlug) {
    const provided = String(data.slug ?? "").trim();
    const base = provided || slugify(String(data[resource.slugSource ?? "title"] ?? "item"));
    data.slug = await uniqueSlug(resource.table, base || "item");
  }

  const columns = Object.keys(data);
  const params: unknown[] = [];
  const placeholders: string[] = [];

  // Susun placeholder mengikuti urutan kolom; kolom JSONB di-cast eksplisit
  // agar array ditulis sebagai jsonb, bukan text.
  columns.forEach((col, i) => {
    if (JSONB_FIELDS.has(col)) {
      placeholders.push(`$${i + 1}::jsonb`);
      params.push(JSON.stringify(data[col]));
    } else {
      placeholders.push(`$${i + 1}`);
      params.push(data[col]);
    }
  });

  const insertColumns = [...columns];
  if (resource.timestampColumn === "published_at") {
    // Kolom `published` tidak bisa dirujuk di dalam VALUES, jadi status
    // publish dikirim sebagai parameter terpisah.
    insertColumns.push("published_at");
    placeholders.push(
      `CASE WHEN $${params.length + 1}::boolean THEN now() ELSE NULL END`
    );
    params.push(Boolean(data.published));
  }

  try {
    await execute(
      `INSERT INTO ${resource.table} (${insertColumns.join(", ")}) VALUES (${placeholders.join(", ")})`,
      params
    );
  } catch (error) {
    return {
      ok: false,
      message: `Gagal menyimpan: ${(error as Error).message}`,
    };
  }

  revalidateResource(key);

  return { ok: true, message: `${resource.title} berhasil ditambahkan.` };
}

export async function updateResource(
  key: string,
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return { ok: false, message: "Resource tidak dikenal." };

  const raw: Record<string, string | undefined> = {};
  for (const field of resource.fields) {
    const value = formData.get(field.name);
    raw[field.name] = typeof value === "string" ? value : undefined;
  }

  const validated = validate(resource, raw);
  if (!validated.ok) {
    return {
      ok: false,
      message: "Periksa kembali isian formulir.",
      errors: validated.errors,
    };
  }

  const data = validated.data;

  if (resource.hasSlug && data.slug) {
    const slug = slugify(String(data.slug));
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM ${resource.table} WHERE slug = $1 AND id <> $2 LIMIT 1`,
      [slug, id]
    );
    if (existing) {
      return {
        ok: false,
        message: "Slug sudah dipakai entitas lain.",
        errors: { slug: "Slug sudah dipakai." },
      };
    }
    data.slug = slug;
  }

  const columns = Object.keys(data);
  const setParts = columns.map((col, i) =>
    JSONB_FIELDS.has(col)
      ? `${col} = $${i + 1}::jsonb`
      : `${col} = $${i + 1}`
  );
  const params = columns.map((col) =>
    JSONB_FIELDS.has(col) ? JSON.stringify(data[col]) : data[col]
  );

  // Posts: isi published_at saat pertama kali dipublikasikan (jangan timpa yang lama).
  const publishStamp =
    resource.timestampColumn === "published_at" && data.published === true
      ? ", published_at = COALESCE(published_at, now())"
      : "";

  try {
    await execute(
      `UPDATE ${resource.table} SET ${setParts.join(", ")}, updated_at = now()${publishStamp} WHERE id = $${columns.length + 1}`,
      [...params, id]
    );
  } catch (error) {
    return {
      ok: false,
      message: `Gagal menyimpan: ${(error as Error).message}`,
    };
  }

  revalidateResource(key);

  return { ok: true, message: `${resource.title} berhasil diperbarui.` };
}

export async function deleteResource(
  key: string,
  id: string
): Promise<ActionResult> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return { ok: false, message: "Resource tidak dikenal." };

  try {
    await execute(`DELETE FROM ${resource.table} WHERE id = $1`, [id]);
  } catch (error) {
    return {
      ok: false,
      message: `Gagal menghapus: ${(error as Error).message}`,
    };
  }

  revalidateResource(key);

  return { ok: true, message: `${resource.title} berhasil dihapus.` };
}

export async function togglePublished(
  key: string,
  id: string,
  published: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const resource = getResource(key);
  if (!resource) return { ok: false, message: "Resource tidak dikenal." };

  // Entitas seperti experiences/skills tidak punya kolom published.
  if (!resource.fields.some((f) => f.name === "published")) {
    return { ok: false, message: `${resource.title} tidak mendukung status publish.` };
  }

  await execute(
    resource.timestampColumn === "published_at"
      ? `UPDATE ${resource.table}
           SET published = $1,
               published_at = CASE WHEN $1 THEN COALESCE(published_at, now()) ELSE published_at END,
               updated_at = now()
         WHERE id = $2`
      : `UPDATE ${resource.table} SET published = $1, updated_at = now() WHERE id = $2`,
    [published, id]
  );

  revalidateResource(key);

  return {
    ok: true,
    message: published ? "Item dipublish." : "Item disimpan sebagai draft.",
  };
}

/* ------------------------------------------------------------------ *
 *  Messages
 * ------------------------------------------------------------------ */

export async function updateMessageStatus(
  id: string,
  status: "new" | "read" | "archived"
): Promise<ActionResult> {
  await requireAdmin();
  await execute("UPDATE messages SET status = $1 WHERE id = $2", [status, id]);
  revalidatePath("/admin/messages");
  return { ok: true, message: "Status pesan diperbarui." };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  await execute("DELETE FROM messages WHERE id = $1", [id]);
  revalidatePath("/admin/messages");
  return { ok: true, message: "Pesan dihapus." };
}

/* ------------------------------------------------------------------ *
 *  Settings
 * ------------------------------------------------------------------ */

export async function saveSettings(
  payload: Record<string, Record<string, unknown>>
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await saveSettingsValues(payload);
  } catch (error) {
    return {
      ok: false,
      message: `Gagal menyimpan pengaturan: ${(error as Error).message}`,
    };
  }

  revalidateSite();
  revalidatePath("/admin/settings");

  return { ok: true, message: "Pengaturan berhasil disimpan." };
}

/* ------------------------------------------------------------------ *
 *  Query helper untuk list admin
 * ------------------------------------------------------------------ */

export async function listResource(
  key: string,
  options?: { search?: string }
): Promise<Record<string, unknown>[]> {
  const resource = getResource(key);
  if (!resource) return [];

  const search = options?.search?.trim();
  if (!search) {
    return query(`SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy}`);
  }

  const searchable = resource.columns
    .filter((c) => c.type !== "boolean" && c.type !== "tags")
    .map((c) => c.name);

  const conditions = searchable
    .map((col, i) => `CAST(${col} AS TEXT) ILIKE $${i + 1}`)
    .join(" OR ");

  return query(
    `SELECT * FROM ${resource.table} WHERE ${conditions} ORDER BY ${resource.orderBy}`,
    searchable.map(() => `%${search}%`)
  );
}
