import { NextResponse, type NextRequest } from "next/server";
import { getPosts } from "@/lib/data";
import { filterPosts } from "@/lib/api-filters";

export const dynamic = "force-dynamic";

/** GET /api/posts?tag=Next.js&limit=3 */
export async function GET(request: NextRequest) {
  const posts = filterPosts(await getPosts(), request.nextUrl.searchParams);
  return NextResponse.json({ data: posts, count: posts.length });
}
