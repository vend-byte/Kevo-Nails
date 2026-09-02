import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.websiteSetting.findFirst();

  return NextResponse.json({
    phone: settings?.phone ?? "0702078249",
    whatsapp: settings?.whatsapp ?? "0702078249",
    instagramAcademyUrl: settings?.instagramAcademyUrl ?? null,
    instagramSalonUrl: settings?.instagramSalonUrl ?? null,
    tiktokAcademyUrl: settings?.tiktokAcademyUrl ?? null,
    tiktokSalonUrl: settings?.tiktokSalonUrl ?? null,
    facebook: settings?.facebook ?? null,
  });
}
