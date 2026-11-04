import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * Trigger revalidasi dari luar (misal webhook).
 * Butuh header x-revalidate-secret yang cocok dengan REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
