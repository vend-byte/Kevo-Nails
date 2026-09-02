import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["RECEIVED", "UNDER_REVIEW", "ACCEPTED", "WAITLISTED", "REJECTED"]),
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
    const application = await prisma.application.update({
      where: { id },
      data: { status: payload.status },
    });
    return NextResponse.json(application);
  } catch {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }
}
