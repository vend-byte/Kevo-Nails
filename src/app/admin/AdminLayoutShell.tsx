"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password";

  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-black md:flex-row">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto text-white">{children}</div>
    </div>
  );
}
