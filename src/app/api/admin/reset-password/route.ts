import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashResetToken, hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : "Please check your input.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const tokenHash = hashResetToken(payload.token);

  const user = await prisma.adminUser.findFirst({
    where: {
      resetTokenHash: tokenHash,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const newHash = await hashPassword(payload.newPassword);

  // Clearing resetTokenHash makes the token single-use — a second attempt
  // with the same link will no longer find a matching user above.
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: newHash, resetTokenHash: null, resetTokenExpiry: null },
  });

  return NextResponse.json({ ok: true });
}
