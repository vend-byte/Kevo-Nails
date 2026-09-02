import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: payload.status },
    });
    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
}
