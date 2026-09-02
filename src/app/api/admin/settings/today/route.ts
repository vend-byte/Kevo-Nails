import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

const WEEKDAY_MAP = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

// Matches the UTC-midnight date convention used everywhere else this app
// deals with calendar dates (see getAvailableSlots in lib/booking.ts).
function todayDate() {
  const isoDate = new Date().toISOString().slice(0, 10);
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const date = todayDate();
  const weekday = WEEKDAY_MAP[date.getUTCDay()];

  const [hours, blocks] = await Promise.all([
    prisma.businessHour.findUnique({ where: { weekday } }),
    prisma.blockedTime.findMany({ where: { date } }),
  ]);

  const fullDayOverride = blocks.find((b) => !b.startTime && !b.endTime);

  return NextResponse.json({
    weekday,
    regularlyOpen: hours?.isOpen ?? false,
    openTime: hours?.openTime ?? null,
    closeTime: hours?.closeTime ?? null,
    closedToday: Boolean(fullDayOverride),
    overrideId: fullDayOverride?.id ?? null,
    overrideReason: fullDayOverride?.reason ?? null,
  });
}

const actionSchema = z.object({
  action: z.enum(["close", "reopen"]),
  reason: z.string().trim().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = actionSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const date = todayDate();

  if (payload.action === "close") {
    // Guard against creating a duplicate full-day block if one already exists.
    const existing = await prisma.blockedTime.findMany({ where: { date } });
    const alreadyBlocked = existing.find((b) => !b.startTime && !b.endTime);
    if (alreadyBlocked) return NextResponse.json(alreadyBlocked);

    const block = await prisma.blockedTime.create({
      data: { date, reason: payload.reason || "Closed for today (admin override)" },
    });
    return NextResponse.json(block);
  }

  // reopen — remove today's full-day block(s), if any.
  await prisma.blockedTime.deleteMany({ where: { date, startTime: null, endTime: null } });
  return NextResponse.json({ ok: true });
}
