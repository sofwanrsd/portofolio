"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Sembunyikan header/footer publik saat berada di area admin. */
export function PublicChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
