import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  status: z.enum(["UPCOMING", "OPEN", "CLOSED", "IN_PROGRESS", "COMPLETED"]),
  registrationOpens: z.string().optional(),
  registrationCloses: z.string().optional(),
  trainingStarts: z.string().optional(),
  courseIds: z.array(z.string()).min(1, "Select at least one course."),
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
    return NextResponse.json({ error: "Please check the intake details." }, { status: 400 });
  }

  try {
    const intake = await prisma.$transaction(async (tx) => {
      await tx.intakeCourse.deleteMany({ where: { intakeId: id } });
      return tx.intake.update({
        where: { id },
        data: {
          name: payload.name,
          status: payload.status,
          registrationOpens: payload.registrationOpens ? new Date(payload.registrationOpens) : null,
          registrationCloses: payload.registrationCloses ? new Date(payload.registrationCloses) : null,
          trainingStarts: payload.trainingStarts ? new Date(payload.trainingStarts) : null,
          courses: { create: payload.courseIds.map((courseId) => ({ courseId })) },
        },
      });
    });
    return NextResponse.json(intake);
  } catch {
    return NextResponse.json({ error: "Intake not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.intake.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "This intake has existing applications and cannot be deleted. Mark it Closed instead." },
      { status: 409 }
    );
  }
}
