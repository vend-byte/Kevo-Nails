import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const hourSchema = z.object({
  weekday: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  isOpen: z.boolean(),
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
  breakStart: z.string().nullable(),
  breakEnd: z.string().nullable(),
});

const updateSchema = z.object({ hours: z.array(hourSchema) });

export async function GET() {
  const hours = await prisma.businessHour.findMany({ orderBy: { weekday: "asc" } });
  return NextResponse.json(hours);
}

export async function PUT(request: NextRequest) {
  let payload;
  try {
    payload = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid business hours data." }, { status: 400 });
  }

  await Promise.all(
    payload.hours.map((h) =>
      prisma.businessHour.upsert({
        where: { weekday: h.weekday },
        update: {
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
          breakStart: h.breakStart,
          breakEnd: h.breakEnd,
        },
        create: {
          weekday: h.weekday,
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
          breakStart: h.breakStart,
          breakEnd: h.breakEnd,
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
