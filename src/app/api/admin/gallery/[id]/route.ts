import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

const updateSchema = z.object({
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  altText: z.string().trim().max(200).optional(),
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
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  try {
    const image = await prisma.galleryImage.update({ where: { id }, data: payload });
    return NextResponse.json(image);
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  // Delete from Cloudinary first — if that fails, keep the DB record so the
  // admin doesn't lose track of an orphaned upload, and surface the error.
  try {
    await deleteImage(image.publicId);
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    return NextResponse.json({ error: "Could not delete the image from storage." }, { status: 500 });
  }

  await prisma.galleryImage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
