import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, applicationStatusUpdateEmailHtml } from "@/lib/email";
import { getSessionUserId } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["RECEIVED", "UNDER_REVIEW", "ACCEPTED", "WAITLISTED", "REJECTED"]),
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
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  let application;
  try {
    application = await prisma.application.update({
      where: { id },
      data: { status: payload.status },
      include: { course: true, intake: true },
    });
  } catch {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (application.email) {
    const html = applicationStatusUpdateEmailHtml({
      fullName: application.fullName,
      courseName: application.course.title,
      intakeName: application.intake.name,
      applicationRef: application.applicationRef,
      status: application.status,
    });

    if (html) {
      const subjectMap: Record<string, string> = {
        UNDER_REVIEW: "Your Application is Under Review — Kevo Nails Academy",
        ACCEPTED: "You're In! Application Accepted — Kevo Nails Academy",
        WAITLISTED: "Application Update — Waitlisted — Kevo Nails Academy",
        REJECTED: "Application Update — Kevo Nails Academy",
      };
      await sendEmail({
        type: "APPLICATION_APPLICANT_CONFIRMATION",
        to: application.email,
        subject: subjectMap[application.status] ?? "Application Update — Kevo Nails Academy",
        applicationId: application.id,
        html,
      });
    }
  }

  return NextResponse.json(application);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.application.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}