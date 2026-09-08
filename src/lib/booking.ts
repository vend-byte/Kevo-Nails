import { prisma } from "./prisma";
import { generateBookingRef } from "./references";
import { Prisma } from "@prisma/client";

const WEEKDAY_MAP = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

interface SlotInput {
  serviceId: string;
  date: string; // "2026-10-12"
}

/**
 * Computes genuinely available time slots for a service on a given date,
 * accounting for business hours, breaks, existing appointments,
 * blocked time, and the service duration / booking interval.
 */
export async function getAvailableSlots({ serviceId, date }: SlotInput) {
  const service = await prisma.service.findUniqueOrThrow({ where: { id: serviceId } });
  const settings = await prisma.websiteSetting.findFirst();
  const bookingInterval = settings?.bookingIntervalMins ?? 30;

  const targetDate = new Date(`${date}T00:00:00.000Z`);
  const weekday = WEEKDAY_MAP[targetDate.getUTCDay()];

  const hours = await prisma.businessHour.findUnique({ where: { weekday } });
  if (!hours || !hours.isOpen || !hours.openTime || !hours.closeTime) {
    return { slots: [], reason: "Closed on this day." };
  }

  const blocks = await prisma.blockedTime.findMany({ where: { date: targetDate } });
  if (blocks.some((b) => !b.startTime && !b.endTime)) {
    return { slots: [], reason: "This day is fully blocked." };
  }

  const existing = await prisma.appointment.findMany({
    where: {
      serviceId,
      date: targetDate,
      status: { notIn: ["CANCELLED"] },
    },
    select: { startTime: true, endTime: true },
  });

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const openMin = toMinutes(hours.openTime);
  const closeMin = toMinutes(hours.closeTime);
  const breakStart = hours.breakStart ? toMinutes(hours.breakStart) : null;
  const breakEnd = hours.breakEnd ? toMinutes(hours.breakEnd) : null;
  const duration = service.durationMins;

  const slots: string[] = [];
  for (let start = openMin; start + duration <= closeMin; start += bookingInterval) {
    const end = start + duration;

    // Skip break periods
    if (breakStart !== null && breakEnd !== null && start < breakEnd && end > breakStart) continue;

    // Skip explicit blocked ranges
    const blockedRange = blocks.some((b) => {
      if (!b.startTime || !b.endTime) return false;
      const bs = toMinutes(b.startTime);
      const be = toMinutes(b.endTime);
      return start < be && end > bs;
    });
    if (blockedRange) continue;

    // Skip slots overlapping existing appointments
    const overlapsExisting = existing.some((a) => {
      const as = a.startTime.getUTCHours() * 60 + a.startTime.getUTCMinutes();
      const ae = a.endTime.getUTCHours() * 60 + a.endTime.getUTCMinutes();
      return start < ae && end > as;
    });
    if (overlapsExisting) continue;

    const h = String(Math.floor(start / 60)).padStart(2, "0");
    const m = String(start % 60).padStart(2, "0");
    slots.push(`${h}:${m}`);
  }

  return { slots, reason: null };
}

interface CreateBookingInput {
  serviceId: string;
  staffId?: string;
  staffNameSnapshot?: string;
  date: string; // "2026-10-12"
  time: string; // "14:00"
  customer: { fullName: string; phone: string; email?: string };
  notes?: string;
}

/**
 * Creates an appointment with database-level double-booking protection.
 * Relies on the @@unique([serviceId, startTime]) constraint in the
 * Appointment model — if two requests race for the same slot, only
 * the first transaction to commit succeeds; the second gets a unique
 * constraint violation (P2002) which we translate into a friendly error.
 */
export async function createBooking(input: CreateBookingInput) {
  const service = await prisma.service.findUniqueOrThrow({ where: { id: input.serviceId } });
  const [h, m] = input.time.split(":").map(Number);
  const date = new Date(`${input.date}T00:00:00.000Z`);
  const startTime = new Date(date);
  startTime.setUTCHours(h, m, 0, 0);
  const endTime = new Date(startTime.getTime() + service.durationMins * 60_000);

  try {
    return await prisma.$transaction(async (tx) => {
      const conflict = await tx.appointment.findFirst({
        where: {
          serviceId: input.serviceId,
          status: { notIn: ["CANCELLED"] },
          AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }],
        },
      });
      if (conflict) {
        throw new Error("SLOT_TAKEN");
      }

      const customer = await tx.customer.create({
        data: {
          fullName: input.customer.fullName,
          phone: input.customer.phone,
          email: input.customer.email,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          bookingRef: generateBookingRef(),
          customerId: customer.id,
          serviceId: input.serviceId,
          staffId: input.staffId,
          staffNameSnapshot: input.staffNameSnapshot,
          date,
          startTime,
          endTime,
          notes: input.notes,
          status: "PENDING",
        },
      });

      return appointment;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("This time slot has just been booked. Please select another available time.");
    }
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      throw new Error("This time slot has just been booked. Please select another available time.");
    }
    throw error;
  }
}
