import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { IntakeStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Nail Training Intakes",
  description:
    "See current and upcoming intakes at Kevo Nails Academy, including registration deadlines and training start dates.",
};

const STATUS_LABELS: Record<IntakeStatus, string> = {
  UPCOMING: "Upcoming",
  OPEN: "Registration Open",
  CLOSED: "Registration Closed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const STATUS_COLORS: Record<IntakeStatus, string> = {
  UPCOMING: "bg-white/10 text-white/70",
  OPEN: "bg-green-500/20 text-green-300",
  CLOSED: "bg-white/10 text-white/40",
  IN_PROGRESS: "bg-brand-blue-light/20 text-brand-blue-light",
  COMPLETED: "bg-white/10 text-white/40",
};

function formatDate(date: Date | null) {
  if (!date) return "TBC";
  return date.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" });
}

export default async function IntakesPage() {
  const intakes = await prisma.intake.findMany({
    include: { courses: { include: { course: true } } },
    orderBy: { registrationOpens: "desc" },
  });

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Upcoming Intakes</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Check registration status and key dates for our upcoming training intakes.
          </p>
        </div>

        {intakes.length === 0 ? (
          <p className="mt-16 text-center text-white/50">
            No intakes are published yet. Please check back soon or contact us on
            WhatsApp for the next training dates.
          </p>
        ) : (
          <div className="mt-16 space-y-6">
            {intakes.map((intake) => (
              <div
                key={intake.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{intake.name}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[intake.status]}`}
                  >
                    {STATUS_LABELS[intake.status]}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
                  <p>
                    <span className="text-white/40">Registration Opens:</span>
                    <br />
                    {formatDate(intake.registrationOpens)}
                  </p>
                  <p>
                    <span className="text-white/40">Registration Closes:</span>
                    <br />
                    {formatDate(intake.registrationCloses)}
                  </p>
                  <p>
                    <span className="text-white/40">Training Starts:</span>
                    <br />
                    {formatDate(intake.trainingStarts)}
                  </p>
                </div>

                {intake.courses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      Courses in this intake
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {intake.courses.map((ic) => (
                        <span
                          key={ic.id}
                          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                        >
                          {ic.course.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {intake.status === "OPEN" && (
                  <div className="mt-6">
                    <Link
                      href={`/apply?intake=${intake.id}`}
                      className="inline-block rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      Apply Now
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
