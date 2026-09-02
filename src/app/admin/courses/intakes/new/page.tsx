import { prisma } from "@/lib/prisma";
import IntakeForm from "@/components/admin/IntakeForm";

export default async function NewIntakePage() {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Add Intake</h1>
      <div className="mt-8">
        <IntakeForm courses={courses} />
      </div>
    </div>
  );
}
