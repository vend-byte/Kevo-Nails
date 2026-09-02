"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  category: string | null;
  priceKsh: number;
  durationMins: number;
}

function formatKsh(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function maxBookingDateISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14); // Customers can only book within the next 2 weeks.
  return d.toISOString().slice(0, 10);
}

export default function BookingForm({ services }: { services: Service[] }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsReason, setSlotsReason] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    bookingRef: string;
    serviceName: string;
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setTime(null);
    setError(null);

    fetch(`/api/booking/availability?serviceId=${serviceId}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setSlotsReason(data.reason ?? null);
      })
      .catch(() => {
        setSlots([]);
        setSlotsReason("Could not load availability. Please try again.");
      })
      .finally(() => setLoadingSlots(false));
  }, [serviceId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) {
      setError("Please select an available time.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date, time, fullName, phone, email, notes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please contact us on WhatsApp.");
        if (res.status === 409) {
          // Re-fetch slots since the one they picked was just taken.
          fetch(`/api/booking/availability?serviceId=${serviceId}&date=${date}`)
            .then((r) => r.json())
            .then((d) => {
              setSlots(d.slots ?? []);
              setTime(null);
            });
        }
        return;
      }

      setConfirmation(data);
    } catch {
      setError("Something went wrong. Please contact us on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-brand-blue-light/40 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-brand-blue-light">Booking Received!</h2>
        <p className="mt-4 text-white/80">
          Your appointment for <strong>{confirmation.serviceName}</strong> on{" "}
          <strong>{confirmation.date}</strong> at <strong>{confirmation.time}</strong> has
          been submitted and is pending confirmation.
        </p>
        <p className="mt-4 text-lg font-mono text-brand-blue-light">
          {confirmation.bookingRef}
        </p>
        <p className="mt-6 text-sm text-white/50">
          We'll be in touch shortly. Save your reference number for your records.
        </p>
      </div>
    );
  }

  const selectedService = services.find((s) => s.id === serviceId);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        >
          {services.map((service) => (
            <option key={service.id} value={service.id} className="bg-brand-black">
              {service.name} — {formatKsh(service.priceKsh)} ({service.durationMins} mins)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Date</label>
        <input
          type="date"
          value={date}
          min={todayISO()}
          max={maxBookingDateISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
        />
        <p className="mt-2 text-xs text-white/40">
          Online booking is available up to 2 weeks in advance. For dates further out, please contact us on WhatsApp.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/80">Available Times</label>
        {loadingSlots ? (
          <p className="text-sm text-white/50">Checking availability…</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-white/50">
            {slotsReason ?? "No available times for this date. Please choose another date."}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  time === slot
                    ? "border-brand-blue-light bg-brand-blue-light text-white"
                    : "border-white/20 text-white/70 hover:border-white/40"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-white/10 pt-6">
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
            Email <span className="text-white/40">(optional)</span>
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
            Notes <span className="text-white/40">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !time}
        className="w-full rounded-full bg-brand-blue-light px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "Submitting…"
          : selectedService
          ? `Confirm Booking — ${formatKsh(selectedService.priceKsh)}`
          : "Confirm Booking"}
      </button>
    </form>
  );
}
