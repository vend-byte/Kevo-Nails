import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const [courses, intakes] = await Promise.all([
    prisma.course.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.intake.findMany({
      include: { courses: { include: { course: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-white/50">No courses yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-white/60">{c.durationText ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {c.priceKsh ? `KSh ${c.priceKsh.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        c.isActive ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {c.isActive ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/courses/${c.id}/edit`}
                        className="text-xs text-brand-blue-light hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        endpoint={`/api/admin/courses/${c.id}`}
                        confirmMessage="Delete this course? If linked to an intake or application it will be hidden instead."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-6 mt-12 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Intakes</h2>
        <Link
          href="/admin/intakes/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Intake
        </Link>
      </div>

      {intakes.length === 0 ? (
        <p className="text-white/50">No intakes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Training Starts</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {intakes.map((i) => (
                <tr key={i.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{i.name}</td>
                  <td className="px-4 py-3 text-white/60">{i.status}</td>
                  <td className="px-4 py-3 text-white/60">
                    {i.courses.map((ic) => ic.course.title).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {i.trainingStarts ? i.trainingStarts.toISOString().slice(0, 10) : "TBC"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/intakes/${i.id}/edit`}
                        className="text-xs text-brand-blue-light hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        endpoint={`/api/admin/intakes/${i.id}`}
                        confirmMessage="Delete this intake? This cannot be undone if it has applications."
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
