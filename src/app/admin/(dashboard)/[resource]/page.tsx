import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getResource } from "@/lib/resources";
import { listResource } from "@/app/actions/admin";
import { ResourceManager } from "@/components/admin/resource-manager";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ resource: string }> };

const DESCRIPTIONS: Record<string, string> = {
  projects: "Karya yang tampil di halaman Project dan beranda.",
  posts: "Artikel blog. Ditulis dengan format Markdown sederhana.",
  services: "Paket harga yang tampil di halaman Layanan.",
  experience: "Pengalaman kerja, pendidikan, organisasi, dan sertifikasi. Keempatnya tampil sebagai bagian terpisah di beranda dan halaman Tentang, jadi tiap entri cukup diisi apa adanya.",
  skills: "Teknologi beserta level penguasaannya.",
  testimonials: "Ulasan klien yang bergulir di beranda.",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { resource } = await params;
  const def = getResource(resource);
  return { title: def?.title ?? "Admin" };
}

export default async function ResourcePage({ params }: Params) {
  const { resource } = await params;
  const def = getResource(resource);
  if (!def) notFound();

  const rows = await listResource(resource);

  return (
    <ResourceManager
      resourceKey={resource}
      title={def.title}
      singular={def.singular}
      description={`${rows.length} ${def.singular} tersimpan. ${DESCRIPTIONS[resource] ?? ""}`.trim()}
      fields={def.fields}
      columns={def.columns}
      rows={rows}
      hasPublished={"published" in def.fields[0] || def.fields.some((f) => f.name === "published")}
    />
  );
}
