import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseForm from "@/components/admin/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Edit Course</h1>
      <div className="mt-8">
        <CourseForm
          initial={{
            id: course.id,
            title: course.title,
            summary: course.summary ?? "",
            description: course.description ?? "",
            durationText: course.durationText ?? "",
            priceKsh: course.priceKsh ?? "",
            requirements: course.requirements ?? "",
            isActive: course.isActive,
          }}
        />
      </div>
    </div>
  );
}
