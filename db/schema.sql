-- ============================================================
--  PORTFOLIO CMS: DATABASE SCHEMA (PostgreSQL / Neon)
--  Jalankan:  npm run db:setup   (otomatis)  atau salin manual ke Neon SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- Admin users ----------
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL DEFAULT 'Admin',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Key-value settings (semi-kustom: teks, warna, section toggle, harga) ----------
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Projects ----------
CREATE TABLE IF NOT EXISTS projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'web',
  cover_image  TEXT NOT NULL DEFAULT '',
  gallery      JSONB NOT NULL DEFAULT '[]'::jsonb,
  stack        JSONB NOT NULL DEFAULT '[]'::jsonb,
  repo_url     TEXT NOT NULL DEFAULT '',
  live_url     TEXT NOT NULL DEFAULT '',
  client       TEXT NOT NULL DEFAULT '',
  year         TEXT NOT NULL DEFAULT '',
  featured     BOOLEAN NOT NULL DEFAULT false,
  published    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Blog posts ----------
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  excerpt     TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  tags        JSONB NOT NULL DEFAULT '[]'::jsonb,
  published   BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Services / Packages (bisa dijual) ----------
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_label TEXT NOT NULL DEFAULT '',
  price_value TEXT NOT NULL DEFAULT '',
  currency    TEXT NOT NULL DEFAULT 'IDR',
  features    JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon        TEXT NOT NULL DEFAULT 'rocket',
  popular     BOOLEAN NOT NULL DEFAULT false,
  published   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Experience timeline ----------
CREATE TABLE IF NOT EXISTS experiences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  period      TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  url         TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Skills ----------
CREATE TABLE IF NOT EXISTS skills (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'Tools',
  level      INTEGER NOT NULL DEFAULT 80,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Testimonials ----------
CREATE TABLE IF NOT EXISTS testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT '',
  company    TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  avatar     TEXT NOT NULL DEFAULT '',
  rating     INTEGER NOT NULL DEFAULT 5,
  published  BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Pesan dari form kontak / inquiry ----------
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL DEFAULT '',
  budget     TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Index untuk query umum ----------
CREATE INDEX IF NOT EXISTS idx_projects_published  ON projects (published, sort_order);
CREATE INDEX IF NOT EXISTS idx_posts_published     ON posts (published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_published  ON services (published, sort_order);
CREATE INDEX IF NOT EXISTS idx_messages_status     ON messages (status, created_at DESC);
