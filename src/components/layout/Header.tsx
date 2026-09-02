"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Our Work" },
  { href: "/academy", label: "Academy" },
  { href: "/intakes", label: "Intakes" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="text-lg font-semibold tracking-wide">
            Kevo <span className="text-brand-blue-light">Nails</span> Academy
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/apply"
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Apply Now
          </Link>
          <Link
            href="/book"
            className="rounded-full bg-brand-blue-light px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Book Appointment
          </Link>
          <Link
            href="/admin"
            aria-label="Admin login"
            title="Admin"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition hover:border-white/30 hover:text-white/80"
          >
            <ShieldCheck size={16} />
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-brand-black px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-white/85"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <Link
                href="/apply"
                className="rounded-full border border-white/30 px-4 py-2 text-center text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Apply Now
              </Link>
              <Link
                href="/book"
                className="rounded-full bg-brand-blue-light px-4 py-2 text-center text-sm font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Book Appointment
              </Link>
              <Link
                href="/admin"
                className="mt-2 flex items-center justify-center gap-2 text-xs text-white/40"
                onClick={() => setOpen(false)}
              >
                <ShieldCheck size={14} />
                Admin
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
