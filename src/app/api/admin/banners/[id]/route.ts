import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

const updateSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(300).optional(),
  buttonText: z.string().trim().max(40).optional(),
  buttonLink: z.string().trim().max(200).optional(),
  startDate: z.string().datetime().optional().or(z.literal("")),
  endDate: z.string().datetime().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
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
    return NextResponse.json({ error: "Please check the banner details." }, { status: 400 });
  }

  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...payload,
        startDate: payload.startDate === "" ? null : payload.startDate,
        endDate: payload.endDate === "" ? null : payload.endDate,
      },
    });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "Banner not found." }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) return NextResponse.json({ error: "Banner not found." }, { status: 404 });

  if (banner.imagePublicId) {
    await deleteImage(banner.imagePublicId).catch((error) =>
      console.error("Cloudinary delete failed:", error)
    );
  }
  await prisma.banner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
