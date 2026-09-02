import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";

const GALLERY_CATEGORIES = [
  "PEDICURE",
  "MANICURE",
  "NAIL_POLISHING",
  "GEL",
  "ACRYLIC",
  "NAIL_ART",
  "NAIL_EXTENSIONS",
  "BEFORE_AFTER",
  "STUDENT_WORK",
  "TRAINING",
] as const;

const uploadSchema = z.object({
  fileDataUri: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().positive(),
  category: z.enum(GALLERY_CATEGORIES),
  altText: z.string().trim().max(200).optional(),
  isFeatured: z.boolean().default(false),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(images);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = uploadSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the image and category." }, { status: 400 });
  }

  try {
    validateImageFile({ type: payload.fileType, size: payload.fileSize });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid image." },
      { status: 400 }
    );
  }

  try {
    const uploaded = await uploadImage(payload.fileDataUri, "gallery");
    const image = await prisma.galleryImage.create({
      data: {
        publicId: uploaded.publicId,
        url: uploaded.url,
        category: payload.category,
        altText: payload.altText,
        isFeatured: payload.isFeatured,
      },
    });
    return NextResponse.json(image);
  } catch (error) {
    console.error("Gallery upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
