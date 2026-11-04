import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

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

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <AdminNav userName={user.name || user.email} />
      <div className="min-w-0 flex-1">
        <AdminMobileNav />
        <div className="px-5 py-7 md:px-8">{children}</div>
      </div>
    </div>
  );
}
