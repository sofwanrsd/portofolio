import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

// Area admin tidak boleh diindeks mesin pencari.
export const metadata: Metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [stats, settings] = await Promise.all([getDashboardStats(), getSettings()]);
  const { site } = settings;

  return (
    <AdminShell
      user={{ name: user.name, email: user.email }}
      siteName={site.name}
      logoText={site.logoText || site.name.slice(0, 2).toUpperCase()}
      newMessages={stats.newMessages}
    >
      {children}
    </AdminShell>
  );
}
