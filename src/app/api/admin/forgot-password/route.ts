import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/auth";
import { sendEmail, adminPasswordResetEmailHtml } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

// Always returns the same generic success message, whether or not the
// email matches an admin account — this prevents an attacker from using
// this endpoint to discover which email addresses have admin access.
const GENERIC_RESPONSE = {
  message: "If that email is associated with an admin account, a password reset link has been sent.",
};

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: payload.email } });

  if (user) {
    const { rawToken, tokenHash } = generateResetToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { resetTokenHash: tokenHash, resetTokenExpiry: expiry },
    });

    // Uses NEXT_PUBLIC_SITE_URL — set this to https://kevoonails.co.ke in
    // Vercel's production environment variables, or reset links will point
    // at whatever this variable currently resolves to (e.g. localhost).
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/admin/reset-password?token=${rawToken}`;

    await sendEmail({
      type: "ADMIN_PASSWORD_RESET",
      to: user.email,
      subject: "Password Reset — Kevo Nails Academy Admin",
      html: adminPasswordResetEmailHtml({ name: user.name, resetUrl }),
    });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
