import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUserId, verifyPassword, hashPassword } from "@/lib/auth";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let payload;
  try {
    payload = passwordSchema.parse(await request.json());
  } catch (error) {
    const message =
      error instanceof z.ZodError ? error.issues[0]?.message : "Please check your input.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const currentOk = await verifyPassword(payload.currentPassword, user.passwordHash);
  if (!currentOk) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const newHash = await hashPassword(payload.newPassword);
  await prisma.adminUser.update({ where: { id: userId }, data: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
