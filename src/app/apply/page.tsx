import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "./ApplicationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Apply Online",
  description: "Apply online to Kevo Nails Academy's nail technician training courses.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; intake?: string }>;
}) {
  const { course, intake } = await searchParams;

  const [courses, intakes] = await Promise.all([
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true },
    }),
    prisma.intake.findMany({
      where: { status: { in: ["UPCOMING", "OPEN"] } },
      orderBy: { registrationOpens: "asc" },
      select: { id: true, name: true, status: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Apply Online</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Take the first step toward becoming a nail technician. Fill in your
            details below.
          </p>
        </div>

        <div className="mt-12">
          {courses.length === 0 || intakes.length === 0 ? (
            <p className="text-center text-white/50">
              Applications aren't open yet. Please check back soon or contact us on
              WhatsApp for the next available intake.
            </p>
          ) : (
            <ApplicationForm
              courses={courses}
              intakes={intakes}
              preselectedCourse={course}
              preselectedIntake={intake}
            />
          )}
        </div>
      </div>
    </main>
  );
}
