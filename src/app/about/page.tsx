import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn who we are at Kevo Nails Academy — our story, our vision, and our mission.",
};

export default async function AboutPage() {
  const settings = await prisma.websiteSetting.findFirst();

  const hasContent = settings?.aboutText || settings?.visionText || settings?.missionText;

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Who We Are</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Getting to know Kevo Nails Academy — our story, our vision, and our mission.
          </p>
        </div>

        {hasContent ? (
          <section className="mt-16 space-y-8">
            {settings?.aboutText && (
              <div>
                <h2 className="text-xl font-semibold text-brand-blue-light">About Us</h2>
                <p className="mt-3 whitespace-pre-line text-white/70">{settings.aboutText}</p>
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              {settings?.visionText && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold text-brand-blue-light">Our Vision</h3>
                  <p className="mt-2 text-sm text-white/70">{settings.visionText}</p>
                </div>
              )}
              {settings?.missionText && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="font-semibold text-brand-blue-light">Our Mission</h3>
                  <p className="mt-2 text-sm text-white/70">{settings.missionText}</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <p className="mt-16 text-center text-white/50">
            Content coming soon.
          </p>
        )}

        <div className="mt-16 text-center">
          <a
            href="/contact"
            className="inline-block rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </main>
  );
}
