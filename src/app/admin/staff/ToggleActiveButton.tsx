"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  fullName: string;
  whatsapp: string;
  role: string | null;
  bio: string | null;
  isActive: boolean;
}

export default function ToggleActiveButton({ id, fullName, whatsapp, role, bio, isActive }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, role, bio, isActive: !isActive }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={isActive ? "text-white/60 hover:text-white" : "text-brand-blue-light hover:opacity-80"}
    >
      {isActive ? "Deactivate" : "Activate"}
    </button>
  );
}
