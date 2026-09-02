"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceFormValues {
  id?: string;
  name: string;
  category: string;
  description: string;
  priceKsh: number | "";
  durationMins: number | "";
  isActive: boolean;
}

export default function ServiceForm({ initial }: { initial?: ServiceFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<ServiceFormValues>(
    initial ?? {
      name: "",
      category: "",
      description: "",
      priceKsh: "",
      durationMins: "",
      isActive: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<ServiceFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = isEdit ? `/api/admin/services/${initial!.id}` : "/api/admin/services";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/admin/services");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Service Name</label>
        <input
          required
          value={values.name}
          onChange={(e) => update({ name: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Category <span className="text-white/40">(e.g. Pedicure, Gel, Nail Art)</span>
        </label>
        <input
          value={values.category}
          onChange={(e) => update({ category: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Price (KSh)</label>
          <input
            required
            type="number"
            min={1}
            value={values.priceKsh}
            onChange={(e) => update({ priceKsh: e.target.value === "" ? "" : Number(e.target.value) })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Duration (mins)</label>
          <input
            required
            type="number"
            min={1}
            value={values.durationMins}
            onChange={(e) => update({ durationMins: e.target.value === "" ? "" : Number(e.target.value) })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Description <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          value={values.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => update({ isActive: e.target.checked })}
        />
        Published (visible to customers)
      </label>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Service"}
      </button>
    </form>
  );
}
