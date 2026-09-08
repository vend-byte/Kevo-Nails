"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Service {
  id: string;
  name: string;
  category: string | null;
  priceKsh: number;
  durationMins: number;
}

interface StaffOption {
  id: string;
  fullName: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminBookingForm({ services, staff }: { services: Service[]; staff: StaffOption[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("Booked via WhatsApp / phone");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setTime(null);
    fetch(`/api/booking/availability?serviceId=${serviceId}&date=${date}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError("Please select a time.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, staffId: staffId || undefined, date, time, fullName, phone, email, notes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create booking.");
        return;
      }

      setSuccess(data.bookingRef);
      setTimeout(() => {
        router.push("/admin/appointments");
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-brand-blue-light/40 bg-white/5 p-6 text-center">
        <p className="text-lg font-semibold text-brand-blue-light">Booking Created</p>
        <p className="mt-2 font-mono text-sm">{success}</p>
        <p className="mt-2 text-sm text-white/50">Redirecting to appointments…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id} className="bg-brand-black">
              {s.name} ({s.durationMins} mins)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/80">Time</label>
          <select
            value={time ?? ""}
            onChange={(e) => setTime(e.target.value || null)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
          >
            <option value="" className="bg-brand-black">
              {loadingSlots ? "Loading…" : "Select time"}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot} className="bg-brand-black">
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Staff Member <span className="text-white/40">(optional)</span>
        </label>
        <select
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        >
          <option value="" className="bg-brand-black">No preference</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id} className="bg-brand-black">
              {s.fullName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Customer Name</label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Phone</label>
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">
          Email <span className="text-white/40">(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand-blue-light"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !time}
        className="w-full rounded-full bg-brand-blue-light px-6 py-2.5 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create Booking"}
      </button>
    </form>
  );
}
