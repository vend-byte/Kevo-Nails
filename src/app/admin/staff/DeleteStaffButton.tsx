"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteStaffButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="text-red-300 hover:text-red-200 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
