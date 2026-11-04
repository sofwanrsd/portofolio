import { NextResponse, type NextRequest } from "next/server";
import { getProjects } from "@/lib/data";
import { filterProjects } from "@/lib/api-filters";

export const dynamic = "force-dynamic";

/** GET /api/projects?category=web&limit=6 */
export async function GET(request: NextRequest) {
  const projects = filterProjects(await getProjects(), request.nextUrl.searchParams);
  return NextResponse.json({ data: projects, count: projects.length });
}
