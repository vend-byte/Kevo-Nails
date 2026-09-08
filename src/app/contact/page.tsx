import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { Weekday } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Location",
  description:
    "Get in touch with Kevo Nails Academy — phone, WhatsApp, email, social media, business hours, and our location.",
};

const LATITUDE = 0.062606;
const LONGITUDE = 37.64568;

const WEEKDAY_ORDER: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function toIntlWhatsApp(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
}

export default async function ContactPage() {
  const [settings, hours] = await Promise.all([
    prisma.websiteSetting.findFirst(),
    prisma.businessHour.findMany(),
  ]);

  const phone = settings?.phone ?? "0702078249";
  const whatsapp = settings?.whatsapp ?? "0702078249";
  const whatsappIntl = toIntlWhatsApp(whatsapp);
  const email = settings?.email;
  const location = settings?.location;

  const orderedHours = WEEKDAY_ORDER.map((day) => hours.find((h) => h.weekday === day)).filter(
    Boolean
  );

  const socialLinks = [
    settings?.instagramAcademyUrl && { label: "Instagram — Academy", href: settings.instagramAcademyUrl },
    settings?.instagramSalonUrl && { label: "Instagram — Salon", href: settings.instagramSalonUrl },
    settings?.tiktokAcademyUrl && { label: "TikTok — Academy", href: settings.tiktokAcademyUrl },
    settings?.tiktokSalonUrl && { label: "TikTok — Salon", href: settings.tiktokSalonUrl },
    settings?.facebook && { label: "Facebook", href: settings.facebook },
  ].filter(Boolean) as { label: string; href: string }[];

  const mapEmbedSrc = `https://maps.google.com/maps?q=${LATITUDE},${LONGITUDE}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${LATITUDE},${LONGITUDE}`;

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            We'd love to hear from you — book a service, ask about the academy, or just say hi.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-brand-blue-light">Get in Touch</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li>
                <span className="text-white/40">Phone:</span> {phone}
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappIntl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-blue-light hover:underline"
                >
                  Chat on WhatsApp: {whatsapp}
                </a>
              </li>
              {email && (
                <li>
                  <span className="text-white/40">Email:</span>{" "}
                  <a href={`mailto:${email}`} className="text-brand-blue-light hover:underline">
                    {email}
                  </a>
                </li>
              )}
              {location && (
                <li>
                  <span className="text-white/40">Location:</span> {location}
                </li>
              )}
            </ul>

            {socialLinks.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/40">Follow Us</p>
                <div className="flex flex-wrap gap-3 text-sm">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue-light hover:underline"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <a
                href="/book"
                className="inline-block rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Book an Appointment
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-brand-blue-light">Business Hours</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {orderedHours.length === 0 ? (
                <li className="text-white/50">Hours not yet configured.</li>
              ) : (
                orderedHours.map((h) => (
                  <li key={h!.weekday} className="flex justify-between">
                    <span>{WEEKDAY_LABELS[h!.weekday]}</span>
                    <span className={h!.isOpen ? "text-white/80" : "text-white/40"}>
                      {h!.isOpen ? `${h!.openTime} – ${h!.closeTime}` : "Closed"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-brand-blue-light">Our Location</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <iframe
              title="Kevo Nails Academy location"
              src={mapEmbedSrc}
              width="100%"
              height="360"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Get Directions
          </a>
        </div>
      </div>
    </main>
  );
}
