"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message ?? "If that email is associated with an admin account, a password reset link has been sent.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-black px-6 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-semibold">
            Kevo <span className="text-brand-blue-light">Nails</span> Academy
          </p>
          <p className="mt-1 text-sm text-white/50">Reset Admin Password</p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-white/80">{message}</p>
            <Link href="/admin/login" className="mt-4 inline-block text-sm text-brand-blue-light hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">Admin Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-blue-light px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send Reset Link"}
            </button>
            <Link href="/admin/login" className="block text-center text-sm text-white/50 hover:text-white">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
