"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseFormValues {
  id?: string;
  title: string;
  summary: string;
  description: string;
  durationText: string;
  priceKsh: number | "";
  requirements: string;
  isActive: boolean;
}

export default function CourseForm({ initial }: { initial?: CourseFormValues }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<CourseFormValues>(
    initial ?? {
      title: "",
      summary: "",
      description: "",
      durationText: "",
      priceKsh: "",
      requirements: "",
      isActive: true,
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<CourseFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = isEdit ? `/api/admin/courses/${initial!.id}` : "/api/admin/courses";
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
      router.push("/admin/courses");
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
        <label className="mb-2 block text-sm font-medium text-white/80">Course Title</label>
        <input
          required
          value={values.title}
          onChange={(e) => update({ title: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Summary <span className="text-white/40">(short, shown on the Academy page)</span>
        </label>
        <input
          value={values.summary}
          onChange={(e) => update({ summary: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Duration <span className="text-white/40">(e.g. "6 weeks")</span>
          </label>
          <input
            value={values.durationText}
            onChange={(e) => update({ durationText: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Price (KSh) <span className="text-white/40">(optional)</span>
          </label>
          <input
            type="number"
            min={1}
            value={values.priceKsh}
            onChange={(e) => update({ priceKsh: e.target.value === "" ? "" : Number(e.target.value) })}
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

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Requirements <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          value={values.requirements}
          onChange={(e) => update({ requirements: e.target.value })}
          rows={2}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => update({ isActive: e.target.checked })}
        />
        Published (visible to visitors)
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
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Course"}
      </button>
    </form>
  );
}
