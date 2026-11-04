import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getResource } from "@/lib/resources";
import { listResource } from "@/app/actions/admin";
import { ResourceManager } from "@/components/admin/resource-manager";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ resource: string }> };

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
      fields={def.fields}
      columns={def.columns}
      rows={rows}
      hasPublished={"published" in def.fields[0] || def.fields.some((f) => f.name === "published")}
    />
  );
}
