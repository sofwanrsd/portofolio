import { NextResponse, type NextRequest } from "next/server";
import { sendContactMessage } from "@/app/actions/contact";
import { contactSchema } from "@/lib/contact";
import type { RateLimitResult } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Pakai skema yang sama dengan form agar pesan error konsisten.
const schema = contactSchema;

/** Header kuota sesuai PROJECT/04-ARCHITECTURE/api-specification.yaml. */
function rateLimitHeaders(rateLimit?: RateLimitResult): Record<string, string> {
  if (!rateLimit) return {};
  return {
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000)),
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa JSON valid." },
      { status: 400 }
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Data tidak valid.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");

  const result = await sendContactMessage(
    parsed.data as Record<string, string | undefined>,
    ip
  );

  if (!result.ok) {
    // Rate limit punya kode status sendiri (429), bukan 422.
    if (result.rateLimited) {
      return NextResponse.json(
        { error: result.message },
        { status: 429, headers: rateLimitHeaders(result.rateLimit) }
      );
    }
    return NextResponse.json(
      { error: result.message, details: result.errors },
      { status: 422, headers: rateLimitHeaders(result.rateLimit) }
    );
  }

  return NextResponse.json(
    { data: { ok: true, message: result.message } },
    { status: 201, headers: rateLimitHeaders(result.rateLimit) }
  );
}
