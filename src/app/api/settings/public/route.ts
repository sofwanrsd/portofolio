import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  // Hanya bagian yang aman untuk publik.
  return NextResponse.json({
    data: {
      site: settings.site,
      theme: settings.theme,
      sections: settings.sections,
      socials: settings.socials,
      features: settings.features,
      footer: settings.footer,
    },
  });
}
