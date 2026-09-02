"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseOption {
  id: string;
  title: string;
}

interface IntakeFormValues {
  id?: string;
  name: string;
  status: string;
  registrationOpens: string;
  registrationCloses: string;
  trainingStarts: string;
  courseIds: string[];
}

const STATUSES = ["UPCOMING", "OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"];

export default function IntakeForm({
  courseOptions,
  initial,
}: {
  courseOptions: CourseOption[];
  initial?: IntakeFormValues;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [values, setValues] = useState<IntakeFormValues>(
    initial ?? {
      name: "",
      status: "UPCOMING",
      registrationOpens: "",
      registrationCloses: "",
      trainingStarts: "",
      courseIds: [],
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<IntakeFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  function toggleCourse(id: string) {
    update({
      courseIds: values.courseIds.includes(id)
        ? values.courseIds.filter((c) => c !== id)
        : [...values.courseIds, id],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = isEdit ? `/api/admin/intakes/${initial!.id}` : "/api/admin/intakes";
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
        <label className="mb-2 block text-sm font-medium text-white/80">Intake Name</label>
        <input
          required
          value={values.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="e.g. October 2026 Intake"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Status</label>
        <select
          value={values.status}
          onChange={(e) => update({ status: e.target.value })}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-brand-black">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Registration Opens</label>
          <input
            type="date"
            value={values.registrationOpens}
            onChange={(e) => update({ registrationOpens: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Registration Closes</label>
          <input
            type="date"
            value={values.registrationCloses}
            onChange={(e) => update({ registrationCloses: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-white/60">Training Starts</label>
          <input
            type="date"
            value={values.trainingStarts}
            onChange={(e) => update({ trainingStarts: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Courses in this Intake</label>
        {courseOptions.length === 0 ? (
          <p className="text-sm text-white/50">Create a course first.</p>
        ) : (
          <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
            {courseOptions.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={values.courseIds.includes(c.id)}
                  onChange={() => toggleCourse(c.id)}
                />
                {c.title}
              </label>
            ))}
          </div>
        )}
      </div>

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
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Create Intake"}
      </button>
    </form>
  );
}
