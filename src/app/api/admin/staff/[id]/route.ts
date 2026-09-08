import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, validateImageFile, deleteImage } from "@/lib/cloudinary";
import { toIntlWhatsapp } from "@/lib/staff-whatsapp";

const staffUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(9),
  role: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean(),
  fileDataUri: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().positive().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.staff.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Staff member not found." }, { status: 404 });

  let payload;
  try {
    payload = staffUpdateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the staff details." }, { status: 400 });
  }

  let photoPublicId = existing.photoPublicId;
  let photoUrl = existing.photoUrl;

  if (payload.fileDataUri && payload.fileType && payload.fileSize) {
    try {
      validateImageFile({ type: payload.fileType, size: payload.fileSize });
      const uploaded = await uploadImage(payload.fileDataUri, "staff");
      if (existing.photoPublicId) await deleteImage(existing.photoPublicId).catch(() => {});
      photoPublicId = uploaded.publicId;
      photoUrl = uploaded.url;
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Photo upload failed." },
        { status: 400 }
      );
    }
  }

  const staff = await prisma.staff.update({
    where: { id },
    data: {
      fullName: payload.fullName,
      whatsapp: toIntlWhatsapp(payload.whatsapp),
      role: payload.role || null,
      bio: payload.bio || null,
      isActive: payload.isActive,
      photoPublicId,
      photoUrl,
    },
  });

  return NextResponse.json(staff);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.staff.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Staff member not found." }, { status: 404 });

  // Historical appointments keep staffNameSnapshot, and the relation is
  // onDelete: SetNull, so deleting here never corrupts past bookings.
  await prisma.staff.delete({ where: { id } });
  if (existing.photoPublicId) await deleteImage(existing.photoPublicId).catch(() => {});

  return NextResponse.json({ ok: true });
}
