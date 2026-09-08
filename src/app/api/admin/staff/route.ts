import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { uploadImage, validateImageFile } from "@/lib/cloudinary";
import { toIntlWhatsapp } from "@/lib/staff-whatsapp";

const staffSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter a full name.").max(120),
  whatsapp: z.string().trim().min(9, "Please enter a valid WhatsApp number."),
  role: z.string().trim().max(80).optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  // Optional new photo, sent as a data URI from the admin form.
  fileDataUri: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().positive().optional(),
});

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const staff = await prisma.staff.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(staff);
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = staffSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the staff details." }, { status: 400 });
  }

  let photoPublicId: string | undefined;
  let photoUrl: string | undefined;

  if (payload.fileDataUri && payload.fileType && payload.fileSize) {
    try {
      validateImageFile({ type: payload.fileType, size: payload.fileSize });
      const uploaded = await uploadImage(payload.fileDataUri, "staff");
      photoPublicId = uploaded.publicId;
      photoUrl = uploaded.url;
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Photo upload failed." },
        { status: 400 }
      );
    }
  }

  const staff = await prisma.staff.create({
    data: {
      fullName: payload.fullName,
      whatsapp: toIntlWhatsapp(payload.whatsapp),
      role: payload.role || undefined,
      bio: payload.bio || undefined,
      isActive: payload.isActive,
      photoPublicId,
      photoUrl,
    },
  });

  return NextResponse.json(staff);
}
