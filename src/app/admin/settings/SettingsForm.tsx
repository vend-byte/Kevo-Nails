"use client";

import { useState } from "react";

interface SettingsValues {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  slogan: string;
  instagramAcademyUrl: string;
  instagramSalonUrl: string;
  tiktokAcademyUrl: string;
  tiktokSalonUrl: string;
  facebook: string;
}

export default function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(patch: Partial<SettingsValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
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
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Business Info
        </p>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Business Name</label>
          <input
            value={values.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Slogan</label>
          <input
            value={values.slogan}
            onChange={(e) => update({ slogan: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Phone</label>
            <input
              value={values.phone}
              onChange={(e) => update({ phone: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">WhatsApp</label>
            <input
              value={values.whatsapp}
              onChange={(e) => update({ whatsapp: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Email <span className="text-white/40">(optional)</span>
          </label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update({ email: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Location <span className="text-white/40">(optional)</span>
          </label>
          <input
            value={values.location}
            onChange={(e) => update({ location: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Social Media
        </p>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Instagram — Academy
          </label>
          <input
            value={values.instagramAcademyUrl}
            onChange={(e) => update({ instagramAcademyUrl: e.target.value })}
            placeholder="https://www.instagram.com/kevoo_nailsacademy"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Instagram — Salon
          </label>
          <input
            value={values.instagramSalonUrl}
            onChange={(e) => update({ instagramSalonUrl: e.target.value })}
            placeholder="https://www.instagram.com/kevoonails"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            TikTok — Academy
          </label>
          <input
            value={values.tiktokAcademyUrl}
            onChange={(e) => update({ tiktokAcademyUrl: e.target.value })}
            placeholder="https://www.tiktok.com/@kevoonailsacademy"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            TikTok — Salon
          </label>
          <input
            value={values.tiktokSalonUrl}
            onChange={(e) => update({ tiktokSalonUrl: e.target.value })}
            placeholder="https://www.tiktok.com/@kevo_onails"
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">
            Facebook <span className="text-white/40">(optional)</span>
          </label>
          <input
            value={values.facebook}
            onChange={(e) => update({ facebook: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <p className="text-sm text-green-400">Saved.</p>}
      </div>
    </form>
  );
}
