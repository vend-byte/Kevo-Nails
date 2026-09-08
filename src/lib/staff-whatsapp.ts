/**
 * Converts a Kenyan number in any common local format (07xx…, 011x…, +254…)
 * into the plain international digits WhatsApp's wa.me links expect
 * (e.g. "254758511514"). Safe to call on a number that's already in that
 * format — it passes through unchanged.
 */
export function toIntlWhatsapp(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}

interface BookingWhatsAppDetails {
  staffName: string;
  staffWhatsapp: string;
  serviceName: string;
  dateLabel: string; // already formatted for display, e.g. "15 September 2026"
  timeLabel: string; // e.g. "2:00 PM"
  durationLabel: string; // e.g. "1 hour 30 minutes"
  priceLabel: string; // e.g. "KSh 2,500"
  customerName?: string;
}

/**
 * Builds the wa.me URL that opens a chat with the selected staff member,
 * pre-filled with a complete, professional booking request message.
 */
export function buildStaffBookingWhatsAppUrl(details: BookingWhatsAppDetails) {
  const greeting = details.customerName
    ? `Hello ${details.staffName}, my name is ${details.customerName}.`
    : `Hello ${details.staffName},`;

  const message = [
    greeting,
    "",
    "I would like to book an appointment at Kevo Nails.",
    "",
    "Appointment Details:",
    `Service: ${details.serviceName}`,
    `Staff: ${details.staffName}`,
    `Date: ${details.dateLabel}`,
    `Time: ${details.timeLabel}`,
    `Duration: ${details.durationLabel}`,
    `Price: ${details.priceLabel}`,
    "",
    "Please confirm the availability of this appointment.",
    "",
    "Thank you.",
  ].join("\n");

  const number = toIntlWhatsapp(details.staffWhatsapp);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function formatDurationLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
  return `${h} hour${h > 1 ? "s" : ""} ${m} minutes`;
}

export function formatKsh(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateLabel(isoDate: string) {
  // isoDate like "2026-09-15" — parsed as UTC midnight to avoid local
  // timezone shifting it to the previous/next day.
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTimeLabel(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
