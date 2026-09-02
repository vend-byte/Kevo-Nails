import CourseForm from "@/components/admin/CourseForm";

export default function NewCoursePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Add Course</h1>
      <div className="mt-8">
        <CourseForm />
      </div>
    </div>
  );
}
