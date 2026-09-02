"use client";

import { useState } from "react";

interface DayHour {
  weekday: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
}

const LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default function HoursEditor({ initialHours }: { initialHours: DayHour[] }) {
  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(weekday: string, patch: Partial<DayHour>) {
    setHours((prev) => prev.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {hours.map((day) => (
        <div
          key={day.weekday}
          className="grid grid-cols-[100px_auto_1fr_1fr] items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <p className="text-sm font-medium">{LABELS[day.weekday]}</p>

          <label className="flex items-center gap-2 text-xs text-white/60">
            <input
              type="checkbox"
              checked={day.isOpen}
              onChange={(e) =>
                update(day.weekday, {
                  isOpen: e.target.checked,
                  openTime: e.target.checked ? day.openTime ?? "09:00" : null,
                  closeTime: e.target.checked ? day.closeTime ?? "18:00" : null,
                })
              }
            />
            Open
          </label>

          <input
            type="time"
            disabled={!day.isOpen}
            value={day.openTime ?? ""}
            onChange={(e) => update(day.weekday, { openTime: e.target.value })}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none disabled:opacity-30"
          />
          <input
            type="time"
            disabled={!day.isOpen}
            value={day.closeTime ?? ""}
            onChange={(e) => update(day.weekday, { closeTime: e.target.value })}
            className="rounded-lg border border-white/20 bg-white/5 px-2 py-1.5 text-sm text-white outline-none disabled:opacity-30"
          />
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Business Hours"}
        </button>
        {saved && <p className="text-sm text-green-400">Saved.</p>}
      </div>
    </div>
  );
}
