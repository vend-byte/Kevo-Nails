import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { sendEmail, bookingAdminEmailHtml, bookingCustomerEmailHtml } from "@/lib/email";
import { getSessionUserId } from "@/lib/auth";

const MAX_BOOKING_DAYS_AHEAD = 14;

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format."),
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(20),
  email: z.string().trim().email("Please enter a valid email.").optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = bookingSchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Please check your booking details and try again." },
      { status: 400 }
    );
  }

  // Public customers can only book within the next MAX_BOOKING_DAYS_AHEAD
  // days. Staff creating a booking from the admin dashboard (e.g. from a
  // WhatsApp/phone order) are exempt, since they may need to book further
  // ahead for special arrangements.
  const isAdminRequest = Boolean(await getSessionUserId());
  if (!isAdminRequest) {
    const requestedDate = new Date(`${payload.date}T00:00:00.000Z`);
    const maxDate = new Date();
    maxDate.setUTCHours(0, 0, 0, 0);
    maxDate.setUTCDate(maxDate.getUTCDate() + MAX_BOOKING_DAYS_AHEAD);

    if (requestedDate.getTime() > maxDate.getTime()) {
      return NextResponse.json(
        { error: `Online bookings are only available up to ${MAX_BOOKING_DAYS_AHEAD} days in advance. Please contact us on WhatsApp for dates further out.` },
        { status: 400 }
      );
    }
  }

  const service = await prisma.service.findUnique({ where: { id: payload.serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Selected service was not found." }, { status: 404 });
  }

  let appointment;
  try {
    appointment = await createBooking({
      serviceId: payload.serviceId,
      date: payload.date,
      time: payload.time,
      customer: {
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email || undefined,
      },
      notes: payload.notes,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("just been booked")) {
      // This time slot has just been booked. Please select another available time.
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Booking creation failed:", error);
    return NextResponse.json(
      { error: "Your booking could not be submitted. Please try again." },
      { status: 500 }
    );
  }

  // The booking is saved. Email delivery failures below must never undo that —
  // sendEmail() always logs PENDING/SENT/FAILED and never throws.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      type: "BOOKING_ADMIN_NOTICE",
      to: adminEmail,
      subject: "New Appointment Booking — Kevo Nails Academy",
      html: bookingAdminEmailHtml({
        customerName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        serviceName: service.name,
        date: payload.date,
        time: payload.time,
        bookingRef: appointment.bookingRef,
        notes: payload.notes,
      }),
    });
  }

  if (payload.email) {
    await sendEmail({
      type: "BOOKING_CUSTOMER_CONFIRMATION",
      to: payload.email,
      subject: "Booking Received — Kevo Nails Academy",
      html: bookingCustomerEmailHtml({
        customerName: payload.fullName,
        serviceName: service.name,
        date: payload.date,
        time: payload.time,
        bookingRef: appointment.bookingRef,
      }),
    });
  }

  return NextResponse.json({
    bookingRef: appointment.bookingRef,
    serviceName: service.name,
    date: payload.date,
    time: payload.time,
  });
}
