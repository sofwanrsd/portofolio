import { NextResponse } from "next/server";
import { hasDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  let database: "connected" | "not_configured" = "not_configured";

  if (hasDatabase()) {
    const rows = await query<{ ok: number }>("SELECT 1 AS ok");
    database = rows.length ? "connected" : "not_configured";
  }

  return NextResponse.json({
    status: "ok",
    database,
    timestamp: new Date().toISOString(),
  });
}
