"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this service? If it has existing appointments, it will be hidden instead.")) {
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/admin/services/${serviceId}`, { method: "DELETE" });
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
