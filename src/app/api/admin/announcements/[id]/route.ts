import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const updateSchema = z.object({
  message: z.string().trim().min(2).max(200).optional(),
  link: z.string().trim().max(200).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  let payload;
  try {
    payload = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the announcement details." }, { status: 400 });
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...payload,
        startDate: payload.startDate === "" ? null : payload.startDate,
        endDate: payload.endDate === "" ? null : payload.endDate,
      },
    });
    return NextResponse.json(announcement);
  } catch {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
  }
}
