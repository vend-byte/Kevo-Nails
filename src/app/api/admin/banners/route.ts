import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(300).optional(),
  buttonText: z.string().trim().max(40).optional(),
  buttonLink: z.string().trim().max(200).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  fileDataUri: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const banners = await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = bannerSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the banner details." }, { status: 400 });
  }

  let imagePublicId: string | undefined;
  let imageUrl: string | undefined;
  if (payload.fileDataUri && payload.fileType && payload.fileSize) {
    try {
      validateImageFile({ type: payload.fileType, size: payload.fileSize });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid image." },
        { status: 400 }
      );
    }
    const uploaded = await uploadImage(payload.fileDataUri, "banners");
    imagePublicId = uploaded.publicId;
    imageUrl = uploaded.url;
  }

  const banner = await prisma.banner.create({
    data: {
      title: payload.title,
      description: payload.description,
      buttonText: payload.buttonText,
      buttonLink: payload.buttonLink,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined,
      isActive: payload.isActive,
      imagePublicId,
      imageUrl,
    },
  });
  return NextResponse.json(banner);
}
