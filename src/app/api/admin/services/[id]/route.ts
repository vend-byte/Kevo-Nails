import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  priceKsh: z.coerce.number().int().positive(),
  durationMins: z.coerce.number().int().positive(),
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
    return NextResponse.json({ error: "Please check the service details." }, { status: 400 });
  }

  try {
    const service = await prisma.service.update({ where: { id }, data: payload });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // Likely has existing appointments referencing it — deactivate instead of blocking.
    await prisma.service.update({ where: { id }, data: { isActive: false } }).catch(() => {});
    return NextResponse.json(
      { error: "This service has existing appointments and was deactivated instead of deleted." },
      { status: 409 }
    );
  }
}
