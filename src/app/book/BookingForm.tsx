"use client";

import { useEffect, useState } from "react";
import {
  buildStaffBookingWhatsAppUrl,
  formatDurationLabel,
  formatKsh,
  formatDateLabel,
  formatTimeLabel,
} from "@/lib/staff-whatsapp";

interface Service {
  id: string;
  name: string;
  category: string | null;
  priceKsh: number;
  durationMins: number;
}

interface StaffMember {
  id: string;
  fullName: string;
  whatsapp: string;
  role: string | null;
  bio: string | null;
  photoUrl: string | null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function maxBookingDateISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14); // Customers can only book within the next 2 weeks.
  return d.toISOString().slice(0, 10);
}

type Step = "service" | "staff" | "date" | "time" | "details" | "review";

const STEP_ORDER: Step[] = ["service", "staff", "date", "time", "details", "review"];

export default function BookingForm({
  services,
  staff,
  preselectedServiceId,
}: {
  services: Service[];
  staff: StaffMember[];
  preselectedServiceId?: string;
}) {
  const validPreselected = services.find((s) => s.id === preselectedServiceId)?.id;

  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState(validPreselected ?? "");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);

  const [slots, setSlots] = useState<string[]>([]);
  const [slotsReason, setSlotsReason] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState<"website" | "whatsapp" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    bookingRef: string;
    serviceName: string;
    staffName: string | null;
    date: string;
    time: string;
  } | null>(null);

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staff.find((s) => s.id === staffId);

  useEffect(() => {
    if (step !== "time" || !serviceId || !date) return;
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
  }, [step, serviceId, date]);

  function goNext() {
    const idx = STEP_ORDER.indexOf(step);
    let nextIdx = idx + 1;
    if (STEP_ORDER[nextIdx] === "staff" && staff.length === 0) nextIdx += 1;
    setStep(STEP_ORDER[nextIdx]);
  }
  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    let prevIdx = idx - 1;
    if (STEP_ORDER[prevIdx] === "staff" && staff.length === 0) prevIdx -= 1;
    setStep(STEP_ORDER[prevIdx]);
  }

  async function handleWebsiteBooking() {
    if (!time || !selectedService) return;
    setSubmitting("website");
    setError(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          staffId: staffId || undefined,
          date,
          time,
          fullName,
          phone,
          email,
          notes,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please contact us on WhatsApp.");
        return;
      }

      setConfirmation(data);
    } catch {
      setError("Something went wrong. Please contact us on WhatsApp.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleWhatsAppBooking() {
    if (!time || !selectedService || !selectedStaff) return;
    setSubmitting("whatsapp");
    setError(null);

    const url = buildStaffBookingWhatsAppUrl({
      staffName: selectedStaff.fullName,
      staffWhatsapp: selectedStaff.whatsapp,
      serviceName: selectedService.name,
      dateLabel: formatDateLabel(date),
      timeLabel: formatTimeLabel(time),
      durationLabel: formatDurationLabel(selectedService.durationMins),
      priceLabel: formatKsh(selectedService.priceKsh),
      customerName: fullName || undefined,
    });

    // Best-effort log for admin visibility — never blocks opening WhatsApp,
    // even if this request fails.
    fetch("/api/booking/whatsapp-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        staffId: selectedStaff.id,
        date,
        time,
        customerName: fullName || "Website visitor",
        customerPhone: phone || "Not provided",
      }),
    }).catch(() => {});

    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitting(null);
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-brand-blue-light/40 bg-white/5 p-8 text-center">
        <h2 className="text-2xl font-semibold text-brand-blue-light">Booking Received!</h2>
        <p className="mt-4 text-white/80">
          Your appointment for <strong>{confirmation.serviceName}</strong>
          {confirmation.staffName && (
            <>
              {" "}
              with <strong>{confirmation.staffName}</strong>
            </>
          )}{" "}
          on <strong>{confirmation.date}</strong> at <strong>{confirmation.time}</strong> has been
          submitted and is pending confirmation.
        </p>
        <p className="mt-4 text-lg font-mono text-brand-blue-light">{confirmation.bookingRef}</p>
        <p className="mt-6 text-sm text-white/50">
          We'll be in touch shortly. Save your reference number for your records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition ${
              STEP_ORDER.indexOf(step) >= i ? "bg-brand-blue-light" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Service */}
      {step === "service" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Service</h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  setServiceId(service.id);
                  goNext();
                }}
                className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition ${
                  serviceId === service.id
                    ? "border-brand-blue-light bg-brand-blue-light/10"
                    : "border-white/15 hover:border-white/30"
                }`}
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-white/50">{service.durationMins} mins</p>
                </div>
                <p className="font-semibold text-brand-blue-light">{formatKsh(service.priceKsh)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Staff */}
      {step === "staff" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Preferred Staff Member</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {staff.map((member) => (
              <button
                key={member.id}
                onClick={() => {
                  setStaffId(member.id);
                  goNext();
                }}
                className={`flex flex-col items-center gap-3 rounded-xl border p-5 text-center transition hover:-translate-y-0.5 ${
                  staffId === member.id
                    ? "border-brand-blue-light bg-brand-blue-light/10"
                    : "border-white/15 hover:border-white/30"
                }`}
              >
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg">
                    {member.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-medium">{member.fullName}</p>
                  {member.role && <p className="text-xs text-white/50">{member.role}</p>}
                </div>
                {member.bio && <p className="text-xs text-white/40">{member.bio}</p>}
                <span
                  className={`rounded-full px-4 py-1 text-xs font-medium ${
                    staffId === member.id
                      ? "bg-brand-blue-light text-white"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  Select {member.fullName.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
          <button onClick={goBack} className="text-sm text-white/50 hover:text-white">
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Date */}
      {step === "date" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Date</h2>
          <input
            type="date"
            value={date}
            min={todayISO()}
            max={maxBookingDateISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-blue-light"
          />
          <p className="text-xs text-white/40">
            Online booking is available up to 2 weeks in advance. For dates further out, please
            contact us on WhatsApp.
          </p>
          <div className="flex justify-between pt-2">
            <button onClick={goBack} className="text-sm text-white/50 hover:text-white">
              ← Back
            </button>
            <button
              onClick={goNext}
              className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Time */}
      {step === "time" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Choose Your Time</h2>
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
          <div className="flex justify-between pt-2">
            <button onClick={goBack} className="text-sm text-white/50 hover:text-white">
              ← Back
            </button>
            <button
              onClick={goNext}
              disabled={!time}
              className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Customer details */}
      {step === "details" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Details</h2>
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
          <div className="flex justify-between pt-2">
            <button onClick={goBack} className="text-sm text-white/50 hover:text-white">
              ← Back
            </button>
            <button
              onClick={goNext}
              disabled={!fullName.trim() || !phone.trim()}
              className="rounded-full bg-brand-blue-light px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Review Appointment
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Review + booking method */}
      {step === "review" && selectedService && time && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Appointment</h2>
          <div className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Service</span>
              <span className="font-medium">{selectedService.name}</span>
            </div>
            {selectedStaff && (
              <div className="flex justify-between">
                <span className="text-white/50">Staff Member</span>
                <span className="font-medium">{selectedStaff.fullName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/50">Date</span>
              <span className="font-medium">{formatDateLabel(date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Time</span>
              <span className="font-medium">{formatTimeLabel(time)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Duration</span>
              <span className="font-medium">{formatDurationLabel(selectedService.durationMins)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-white/50">Price</span>
              <span className="font-semibold text-brand-blue-light">
                {formatKsh(selectedService.priceKsh)}
              </span>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-center text-sm font-medium text-white/70">
              How would you like to book?
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedStaff && (
                <button
                  onClick={handleWhatsAppBooking}
                  disabled={submitting !== null}
                  className="rounded-xl border border-[#25D366]/50 bg-[#25D366]/10 px-5 py-4 text-left transition hover:bg-[#25D366]/20 disabled:opacity-50"
                >
                  <p className="font-medium text-[#25D366]">💬 Book via WhatsApp</p>
                  <p className="mt-1 text-xs text-white/60">
                    Send these details directly to {selectedStaff.fullName}.
                  </p>
                </button>
              )}
              <button
                onClick={handleWebsiteBooking}
                disabled={submitting !== null}
                className="rounded-xl border border-brand-blue-light/50 bg-brand-blue-light/10 px-5 py-4 text-left transition hover:bg-brand-blue-light/20 disabled:opacity-50"
              >
                <p className="font-medium text-brand-blue-light">📅 Book via Website</p>
                <p className="mt-1 text-xs text-white/60">
                  {submitting === "website" ? "Submitting…" : "Save this appointment directly through Kevo Nails."}
                </p>
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button onClick={goBack} className="text-sm text-white/50 hover:text-white">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
