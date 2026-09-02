import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const intakeSchema = z.object({
  name: z.string().trim().min(2).max(150),
  status: z.enum(["UPCOMING", "OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"]),
  registrationOpens: z.string().optional(),
  registrationCloses: z.string().optional(),
  trainingStarts: z.string().optional(),
  courseIds: z.array(z.string()).min(1, "Select at least one course."),
});

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = intakeSchema.parse(await request.json());
  } catch (e) {
    return NextResponse.json({ error: "Please check the intake details." }, { status: 400 });
  }

  const intake = await prisma.intake.create({
    data: {
      name: payload.name,
      status: payload.status,
      registrationOpens: payload.registrationOpens ? new Date(payload.registrationOpens) : null,
      registrationCloses: payload.registrationCloses ? new Date(payload.registrationCloses) : null,
      trainingStarts: payload.trainingStarts ? new Date(payload.trainingStarts) : null,
      courses: { create: payload.courseIds.map((courseId) => ({ courseId })) },
    },
  });

  return NextResponse.json(intake);
}
