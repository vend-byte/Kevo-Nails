import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  businessName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  whatsapp: z.string().trim().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  location: z.string().trim().optional(),
  slogan: z.string().trim().min(1),
  instagramAcademyUrl: z.string().trim().url().optional().or(z.literal("")),
  instagramSalonUrl: z.string().trim().url().optional().or(z.literal("")),
  tiktokAcademyUrl: z.string().trim().url().optional().or(z.literal("")),
  tiktokSalonUrl: z.string().trim().url().optional().or(z.literal("")),
  facebook: z.string().trim().url().optional().or(z.literal("")),
});

export async function GET() {
  const settings = await prisma.websiteSetting.findFirst();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  let payload;
  try {
    payload = settingsSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the settings values." }, { status: 400 });
  }

  const existing = await prisma.websiteSetting.findFirst();

  const data = {
    ...payload,
    email: payload.email || null,
    location: payload.location || null,
    instagramAcademyUrl: payload.instagramAcademyUrl || null,
    instagramSalonUrl: payload.instagramSalonUrl || null,
    tiktokAcademyUrl: payload.tiktokAcademyUrl || null,
    tiktokSalonUrl: payload.tiktokSalonUrl || null,
    facebook: payload.facebook || null,
  };

  const settings = existing
    ? await prisma.websiteSetting.update({ where: { id: existing.id }, data })
    : await prisma.websiteSetting.create({ data });

  return NextResponse.json(settings);
}
