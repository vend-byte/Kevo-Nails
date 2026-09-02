"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this course? If it has existing applications, it will be hidden instead.")) {
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-400 hover:underline disabled:opacity-50"
    >
      {deleting ? "…" : "Delete"}
    </button>
  );
}
