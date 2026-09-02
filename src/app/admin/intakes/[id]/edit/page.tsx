import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import IntakeForm from "@/components/admin/IntakeForm";

export const dynamic = "force-dynamic";

export default async function EditIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [intake, courses] = await Promise.all([
    prisma.intake.findUnique({ where: { id }, include: { courses: true } }),
    prisma.course.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!intake) notFound();

  function toDateInput(date: Date | null) {
    return date ? date.toISOString().slice(0, 10) : "";
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Edit Intake</h1>
      <div className="mt-8">
        <IntakeForm
          courseOptions={courses}
          initial={{
            id: intake.id,
            name: intake.name,
            status: intake.status,
            registrationOpens: toDateInput(intake.registrationOpens),
            registrationCloses: toDateInput(intake.registrationCloses),
            trainingStarts: toDateInput(intake.trainingStarts),
            courseIds: intake.courses.map((c) => c.courseId),
          }}
        />
      </div>
    </div>
  );
}
