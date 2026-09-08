"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface StaffRecord {
  id: string;
  fullName: string;
  whatsapp: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
  isActive: boolean;
}

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
}

export default function StaffForm({ staff }: { staff?: StaffRecord }) {
  const router = useRouter();
  const isEdit = Boolean(staff);

  const [fullName, setFullName] = useState(staff?.fullName ?? "");
  const [whatsapp, setWhatsapp] = useState(staff?.whatsapp ?? "");
  const [role, setRole] = useState(staff?.role ?? "");
  const [bio, setBio] = useState(staff?.bio ?? "");
  const [isActive, setIsActive] = useState(staff?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(staff?.photoUrl ?? null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(await readFileAsDataUri(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = { fullName, whatsapp, role, bio, isActive };
      if (file) {
        body.fileDataUri = await readFileAsDataUri(file);
        body.fileType = file.type;
        body.fileSize = file.size;
      }

      const res = await fetch(isEdit ? `/api/admin/staff/${staff!.id}` : "/api/admin/staff", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/admin/staff");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Full Name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">WhatsApp Number</label>
        <input
          required
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="07XXXXXXXX or 254XXXXXXXXX"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
        <p className="mt-1 text-xs text-white/40">
          Any common format works — it's automatically converted for WhatsApp links.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Role / Position <span className="text-white/40">(optional)</span>
        </label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Senior Nail Technician"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Short Bio <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Profile Photo <span className="text-white/40">(optional)</span>
        </label>
        {preview && (
          <img src={preview} alt="Preview" className="mb-3 h-20 w-20 rounded-full object-cover" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="w-full text-sm text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-white/30 bg-white/5"
        />
        Active (visible for new bookings)
      </label>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Staff Member"}
      </button>
    </form>
  );
}
