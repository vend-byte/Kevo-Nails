"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsValues {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  slogan: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  chatbotEnabled: boolean;
}

interface TodayStatus {
  weekday: string;
  regularlyOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  closedToday: boolean;
}

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default function SettingsManager({
  settings,
  today,
}: {
  settings: SettingsValues;
  today: TodayStatus;
}) {
  return (
    <div className="max-w-2xl space-y-12">
      <TodaySection today={today} />
      <BusinessInfoSection initial={settings} />
      <PasswordSection />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TODAY'S STATUS — the thing an admin needs to change fastest, e.g. "we're
// closing early today". Reuses the same BlockedTime the booking engine
// already checks, so this takes effect on the public site immediately.
// ---------------------------------------------------------------------------

function TodaySection({ today }: { today: TodayStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regularHoursText =
    today.regularlyOpen && today.openTime && today.closeTime
      ? `Regular hours: ${today.openTime}–${today.closeTime}`
      : "Regularly closed on this day";

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: today.closedToday ? "reopen" : "close" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not update today's status.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-white">Today ({WEEKDAY_LABELS[today.weekday]})</h2>
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5 ${
          today.closedToday ? "border-red-500/30 bg-red-500/10" : "border-green-500/30 bg-green-500/10"
        }`}
      >
        <div>
          <p className="text-sm font-medium text-white">
            {today.closedToday ? "Closed today (admin override)" : "Open today"}
          </p>
          <p className="mt-1 text-xs text-white/50">{regularHoursText}</p>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className={`rounded-full px-5 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
            today.closedToday ? "bg-green-600 hover:opacity-90" : "bg-red-600 hover:opacity-90"
          }`}
        >
          {busy ? "Updating…" : today.closedToday ? "Reopen today" : "Close for today"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
      <p className="mt-2 text-xs text-white/40">
        This only affects today&apos;s date. Regular weekly hours are managed on the Business Hours page.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BUSINESS INFO
// ---------------------------------------------------------------------------

function BusinessInfoSection({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<SettingsValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-white">Business Info</h2>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" value={values.businessName} onChange={(v) => update({ businessName: v })} required />
          <Field label="Slogan" value={values.slogan} onChange={(v) => update({ slogan: v })} />
          <Field label="Phone" value={values.phone} onChange={(v) => update({ phone: v })} required />
          <Field label="WhatsApp" value={values.whatsapp} onChange={(v) => update({ whatsapp: v })} required />
          <Field label="Email" value={values.email} onChange={(v) => update({ email: v })} />
          <Field label="Location" value={values.location} onChange={(v) => update({ location: v })} />
          <Field label="Instagram" value={values.instagram} onChange={(v) => update({ instagram: v })} />
          <Field label="Facebook" value={values.facebook} onChange={(v) => update({ facebook: v })} />
          <Field label="TikTok" value={values.tiktok} onChange={(v) => update({ tiktok: v })} />
        </div>

        <Field label="Default SEO title" value={values.seoDefaultTitle} onChange={(v) => update({ seoDefaultTitle: v })} />
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Default SEO description</label>
          <textarea
            value={values.seoDefaultDescription}
            onChange={(e) => update({ seoDefaultDescription: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={values.chatbotEnabled}
            onChange={(e) => update({ chatbotEnabled: e.target.checked })}
          />
          Chatbot enabled on the public site
        </label>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {saved && <p className="text-sm text-green-300">Saved.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Business Info"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PASSWORD CHANGE
// ---------------------------------------------------------------------------

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-white">Change Password</h2>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Current password</label>
          <input
            required
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">New password</label>
          <input
            required
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Confirm new password</label>
          <input
            required
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-blue-light"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {success && <p className="text-sm text-green-300">Password updated.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
