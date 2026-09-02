"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteIntakeButton({ intakeId }: { intakeId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("Delete this intake?")) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/intakes/${intakeId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not delete this intake.");
        return;
      }
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-red-400 hover:underline disabled:opacity-50"
      >
        {deleting ? "…" : "Delete"}
      </button>
      {error && <span className="ml-2 text-xs text-red-400">{error}</span>}
    </span>
  );
}
