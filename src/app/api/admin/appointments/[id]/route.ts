import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, bookingStatusUpdateEmailHtml } from "@/lib/email";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let payload;
  try {
    payload = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  let appointment;
  try {
    appointment = await prisma.appointment.update({
      where: { id },
      data: { status: payload.status },
      include: { customer: true, service: true },
    });
  } catch {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  if (appointment.customer.email) {
    const html = bookingStatusUpdateEmailHtml({
      customerName: appointment.customer.fullName,
      serviceName: appointment.service.name,
      date: appointment.date.toISOString().slice(0, 10),
      time: appointment.startTime.toISOString().slice(11, 16),
      bookingRef: appointment.bookingRef,
      status: appointment.status,
    });

    if (html) {
      const subjectMap: Record<string, string> = {
        CONFIRMED: "Your Appointment is Confirmed — Kevo Nails Academy",
        RESCHEDULED: "Your Appointment Has Been Rescheduled — Kevo Nails Academy",
        CANCELLED: "Your Appointment Was Cancelled — Kevo Nails Academy",
      };
      await sendEmail({
        type: "BOOKING_CUSTOMER_CONFIRMATION",
        to: appointment.customer.email,
        subject: subjectMap[appointment.status] ?? "Appointment Update — Kevo Nails Academy",
        html,
      });
    }
  }

  return NextResponse.json(appointment);
}
