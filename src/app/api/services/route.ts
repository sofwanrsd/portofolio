import { NextResponse } from "next/server";
import { getServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await getServices();
  return NextResponse.json({ data: services, count: services.length });
}
