import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.websiteSetting.findFirst();

  return NextResponse.json({
    phone: settings?.phone ?? "0702078249",
    whatsapp: settings?.whatsapp ?? "0702078249",
    email: settings?.email ?? null,
    location: settings?.location ?? null,
    instagramAcademyUrl: settings?.instagramAcademyUrl ?? null,
    instagramSalonUrl: settings?.instagramSalonUrl ?? null,
    tiktokAcademyUrl: settings?.tiktokAcademyUrl ?? null,
    tiktokSalonUrl: settings?.tiktokSalonUrl ?? null,
    facebook: settings?.facebook ?? null,
    whatsappButtonEnabled: settings?.whatsappButtonEnabled ?? true,
    whatsappGlowEnabled: settings?.whatsappGlowEnabled ?? true,
    whatsappDefaultMessage:
      settings?.whatsappDefaultMessage ??
      "Hi Kevo Nails Academy! I'd like to know more about your services.",
    aboutText: settings?.aboutText ?? null,
    visionText: settings?.visionText ?? null,
    missionText: settings?.missionText ?? null,
  });
}
