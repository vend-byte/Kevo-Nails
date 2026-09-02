import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nail Training Academy",
  description:
    "Learn professional nail techniques at Kevo Nails Academy. Explore our courses and start your journey as a nail technician.",
};

function formatKsh(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AcademyPage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Nail Training Academy</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Hands-on training for aspiring nail technicians, taught by working
            professionals. Build real skills you can use from day one.
          </p>
        </div>

        {courses.length === 0 ? (
          <p className="mt-16 text-center text-white/50">
            No courses are published yet. Please check back soon or contact us on
            WhatsApp for details.
          </p>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-xl font-semibold">{course.title}</h2>
                {course.summary && (
                  <p className="mt-2 text-sm text-white/60">{course.summary}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/50">
                  {course.durationText && <span>⏱ {course.durationText}</span>}
                  {course.priceKsh != null && (
                    <span className="font-medium text-brand-blue-light">
                      {formatKsh(course.priceKsh)}
                    </span>
                  )}
                </div>

                {course.requirements && (
                  <p className="mt-4 text-sm text-white/60">
                    <span className="font-medium text-white/80">Requirements: </span>
                    {course.requirements}
                  </p>
                )}

                <div className="mt-auto pt-6">
                  <Link
                    href={`/apply?course=${course.id}`}
                    className="inline-block rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Apply for this Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/intakes"
            className="inline-block rounded-full border border-white/30 px-8 py-3 font-medium text-white transition hover:bg-white/10"
          >
            View Upcoming Intakes
          </Link>
        </div>
      </div>
    </main>
  );
}
