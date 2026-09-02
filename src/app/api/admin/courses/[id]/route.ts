import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(150),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  durationText: z.string().trim().max(60).optional(),
  priceKsh: z.coerce.number().int().positive().optional(),
  requirements: z.string().trim().max(1000).optional(),
  isActive: z.boolean(),
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
    return NextResponse.json({ error: "Please check the course details." }, { status: 400 });
  }

  try {
    const course = await prisma.course.update({ where: { id }, data: payload });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // Likely referenced by an intake or application — deactivate instead of blocking.
    await prisma.course.update({ where: { id }, data: { isActive: false } }).catch(() => {});
    return NextResponse.json(
      { error: "This course is linked to an intake or application and was hidden instead of deleted." },
      { status: 409 }
    );
  }
}
