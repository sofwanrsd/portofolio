export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  cover_image: string;
  gallery: string[];
  stack: string[];
  repo_url: string;
  live_url: string;
  client: string;
  year: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_label: string;
  price_value: string;
  currency: string;
  features: string[];
  icon: string;
  popular: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  url: string;
  sort_order: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  published: boolean;
  sort_order: number;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  budget: string;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  created_at: string;
}

/* ---------- Settings (JSONB per key) ---------- */

export interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  logoText: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  showAvailability: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryText: string;
  heroSecondaryLink: string;
  /** Gambar pendamping di sisi kanan hero. Kosong = tampilkan gradient mesh. */
  heroImage: string;
}

export interface ThemeSettings {
  accent: string;
  accentSecondary: string;
  mode: "dark" | "light";
  font: string;
  radius: "soft" | "sharp" | "round";
  showGrid: boolean;
}

export interface SectionSettings {
  hero: boolean;
  services: boolean;
  projects: boolean;
  about: boolean;
  skills: boolean;
  experience: boolean;
  testimonials: boolean;
  pricing: boolean;
  blog: boolean;
  cta: boolean;
  contact: boolean;
}

export interface SocialSettings {
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string;
}

export interface FeatureSettings {
  hireMeEnabled: boolean;
  hireMeTitle: string;
  hireMeText: string;
  hireMeButtonText: string;
  hireMeButtonLink: string;
  showPricing: boolean;
  pricingTitle: string;
  pricingSubtitle: string;
  ctaTitle: string;
  ctaText: string;
  ctaButtonText: string;
}

export interface FooterSettings {
  tagline: string;
  showCopyright: boolean;
  copyrightText: string;
}

export interface AppSettings {
  site: SiteSettings;
  theme: ThemeSettings;
  sections: SectionSettings;
  socials: SocialSettings;
  seo: SeoSettings;
  features: FeatureSettings;
  footer: FooterSettings;
}
