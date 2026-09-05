"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid. Please request a new one.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
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
          <p className="mt-1 text-sm text-white/50">Set a New Password</p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-green-400">Password updated. Redirecting to login…</p>
          </div>
        ) : !token ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-sm text-red-300">This reset link is missing or invalid.</p>
            <Link href="/admin/forgot-password" className="mt-4 inline-block text-sm text-brand-blue-light hover:underline">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">New Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">Confirm New Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-brand-blue-light px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
