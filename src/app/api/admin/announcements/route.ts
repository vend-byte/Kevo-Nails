import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const announcementSchema = z.object({
  message: z.string().trim().min(2).max(200),
  link: z.string().trim().max(200).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = announcementSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the announcement details." }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      message: payload.message,
      link: payload.link,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined,
      isActive: payload.isActive,
    },
  });
  return NextResponse.json(announcement);
}
