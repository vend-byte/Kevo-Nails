import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(7).max(20),
});

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Re-derive everything from the database — never trust price/duration/
  // staff name sent from the browser (see spec section 25).
  const [service, staff] = await Promise.all([
    prisma.service.findUnique({ where: { id: payload.serviceId } }),
    prisma.staff.findUnique({ where: { id: payload.staffId } }),
  ]);
  if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });
  if (!staff || !staff.isActive) {
    return NextResponse.json({ error: "Staff member is not available." }, { status: 400 });
  }

  const log = await prisma.whatsappBookingLog.create({
    data: {
      staffId: staff.id,
      staffName: staff.fullName,
      serviceName: service.name,
      priceKsh: service.priceKsh,
      durationMins: service.durationMins,
      date: payload.date,
      time: payload.time,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
    },
  });

  return NextResponse.json({ ok: true, id: log.id });
}
