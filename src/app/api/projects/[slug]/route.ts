import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return NextResponse.json(
      { error: "Project tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: project });
}
