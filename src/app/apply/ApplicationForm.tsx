"use client";

import { useState } from "react";

interface Course {
  id: string;
  title: string;
}
interface Intake {
  id: string;
  name: string;
  status: string;
}

export default function ApplicationForm({
  courses,
  intakes,
  preselectedCourse,
  preselectedIntake,
}: {
  courses: Course[];
  intakes: Intake[];
  preselectedCourse?: string;
  preselectedIntake?: string;
}) {
  const [courseId, setCourseId] = useState(preselectedCourse ?? courses[0]?.id ?? "");
  const [intakeId, setIntakeId] = useState(preselectedIntake ?? intakes[0]?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    applicationRef: string;
    courseName: string;
    intakeName: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/applications/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, intakeId, fullName, phone, email, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Your application could not be submitted. Please try again.");
        return;
      }

      setConfirmation(data);
    } catch {
      setError("Your application could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-brand-blue-light/40 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-brand-blue-light">
          Application Received!
        </h2>
        <p className="mt-4 text-white/80">
          Thank you for applying to <strong>{confirmation.courseName}</strong> —{" "}
          <strong>{confirmation.intakeName}</strong>.
        </p>
        <p className="mt-4 text-lg font-mono text-brand-blue-light">
          {confirmation.applicationRef}
        </p>
        <p className="mt-6 text-sm text-white/50">
          We'll review your application and contact you soon. Save your reference
          number for your records.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id} className="bg-brand-black">
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Intake</label>
        <select
          value={intakeId}
          onChange={(e) => setIntakeId(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        >
          {intakes.map((i) => (
            <option key={i.id} value={i.id} className="bg-brand-black">
              {i.name} {i.status === "OPEN" ? "" : `(${i.status})`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Full Name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Phone</label>
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="07XXXXXXXX"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Email <span className="text-white/40">(optional, recommended for confirmation)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Message <span className="text-white/40">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Anything you'd like us to know — prior experience, questions, etc."
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-brand-blue-light px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
