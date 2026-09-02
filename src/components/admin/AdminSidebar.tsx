"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Megaphone,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_SECTIONS: { title?: string; items: { href: string; label: string; icon: any }[] }[] = [
  { items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Bookings",
    items: [
      { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
      { href: "/admin/customers", label: "Customers", icon: Users },
      { href: "/admin/services", label: "Services", icon: Scissors },
    ],
  },
  {
    title: "Academy",
    items: [
      { href: "/admin/applications", label: "Applications", icon: FileText },
      { href: "/admin/courses", label: "Courses & Intakes", icon: GraduationCap },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/marketing", label: "Banners & Announcements", icon: Megaphone },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/admin/hours", label: "Business Hours", icon: Clock },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-sm font-semibold">
          Kevo <span className="text-brand-blue-light">Nails</span> Academy
        </p>
        <p className="mt-0.5 text-xs text-white/40">Admin Dashboard</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.title && (
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-white/30">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-brand-blue-light text-white"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar — visible below md, replaces the static sidebar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-brand-black px-4 py-3 text-white md:hidden">
        <p className="text-sm font-semibold">
          Kevo <span className="text-brand-blue-light">Nails</span> Admin
        </p>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Desktop static sidebar — hidden on mobile */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-brand-black text-white md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/10 bg-brand-black text-white shadow-xl">
            <div className="flex items-center justify-end px-3 pt-3">
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

