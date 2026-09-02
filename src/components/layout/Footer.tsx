"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Instagram, Facebook } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "0702078249";

// Simple TikTok icon — lucide-react has no official TikTok glyph.
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
    </svg>
  );
}

interface PublicSettings {
  instagramAcademyUrl: string | null;
  instagramSalonUrl: string | null;
  tiktokAcademyUrl: string | null;
  tiktokSalonUrl: string | null;
  facebook: string | null;
}

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const socialLinks = [
    settings?.instagramAcademyUrl && {
      href: settings.instagramAcademyUrl,
      label: "Instagram — Academy",
      icon: <Instagram size={18} />,
    },
    settings?.instagramSalonUrl && {
      href: settings.instagramSalonUrl,
      label: "Instagram — Salon",
      icon: <Instagram size={18} />,
    },
    settings?.tiktokAcademyUrl && {
      href: settings.tiktokAcademyUrl,
      label: "TikTok — Academy",
      icon: <TikTokIcon />,
    },
    settings?.tiktokSalonUrl && {
      href: settings.tiktokSalonUrl,
      label: "TikTok — Salon",
      icon: <TikTokIcon />,
    },
    settings?.facebook && {
      href: settings.facebook,
      label: "Facebook",
      icon: <Facebook size={18} />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <footer className="border-t border-white/10 bg-brand-black text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-white">
            Kevo <span className="text-brand-blue-light">Nails</span> Academy
          </p>
          <p className="mt-3 text-sm">Where Passion Meets Precision</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
            Explore
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/services" className="hover:text-white">Services</Link></li>
            <li><Link href="/gallery" className="hover:text-white">Our Work</Link></li>
            <li><Link href="/academy" className="hover:text-white">Academy</Link></li>
            <li><Link href="/intakes" className="hover:text-white">Intakes</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
            Get Started
          </p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/book" className="hover:text-white">Book an Appointment</Link></li>
            <li><Link href="/apply" className="hover:text-white">Apply to the Academy</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
            Contact
          </p>
          <ul className="space-y-2 text-sm">
            <li>Phone / WhatsApp: {WHATSAPP_NUMBER}</li>
          </ul>
          {socialLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/30 hover:text-white"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Kevo Nails Academy. All rights reserved.
      </div>
    </footer>
  );
}
