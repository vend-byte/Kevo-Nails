import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateApplicationRef } from "@/lib/references";
import {
  sendEmail,
  applicationAdminEmailHtml,
  applicationApplicantEmailHtml,
} from "@/lib/email";
import { Prisma } from "@prisma/client";

const applicationSchema = z.object({
  courseId: z.string().min(1, "Please select a course."),
  intakeId: z.string().min(1, "Please select an intake."),
  fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
  phone: z.string().trim().min(7, "Please enter a valid phone number.").max(20),
  email: z.string().trim().email("Please enter a valid email.").optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional(),
});

async function createWithUniqueRef(data: {
  courseId: string;
  intakeId: string;
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
}) {
  // Reference numbers are random, not sequential, so a collision is
  // extremely unlikely — but we still guard against it with a retry
  // rather than letting a rare collision fail the whole submission.
  for (let i = 0; i < 3; i++) {
    try {
      return await prisma.application.create({
        data: {
          applicationRef: generateApplicationRef(),
          courseId: data.courseId,
          intakeId: data.intakeId,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || undefined,
          message: data.message,
          status: "RECEIVED",
        },
      });
    } catch (error) {
      const isRefCollision =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        (error.meta?.target as string[])?.includes("applicationRef");
      if (!isRefCollision || i === 2) throw error;
    }
  }
  throw new Error("Could not generate a unique application reference.");
}

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = applicationSchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Please check your application details and try again." },
      { status: 400 }
    );
  }

  const [course, intake] = await Promise.all([
    prisma.course.findUnique({ where: { id: payload.courseId } }),
    prisma.intake.findUnique({ where: { id: payload.intakeId } }),
  ]);

  if (!course) {
    return NextResponse.json({ error: "Selected course was not found." }, { status: 404 });
  }
  if (!intake) {
    return NextResponse.json({ error: "Selected intake was not found." }, { status: 404 });
  }

  let application;
  try {
    application = await createWithUniqueRef({
      courseId: payload.courseId,
      intakeId: payload.intakeId,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email || undefined,
      message: payload.message,
    });
  } catch (error) {
    console.error("Application creation failed:", error);
    return NextResponse.json(
      { error: "Your application could not be submitted. Please try again." },
      { status: 500 }
    );
  }

  // The application is saved. Email failures below must never undo that —
  // sendEmail() always logs PENDING/SENT/FAILED and never throws.
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail({
      type: "APPLICATION_ADMIN_NOTICE",
      to: adminEmail,
      subject: "New Student Application — Kevo Nails Academy",
      applicationId: application.id,
      html: applicationAdminEmailHtml({
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        courseName: course.title,
        intakeName: intake.name,
        applicationRef: application.applicationRef,
        createdAt: application.createdAt,
      }),
    });
  }

  if (payload.email) {
    await sendEmail({
      type: "APPLICATION_APPLICANT_CONFIRMATION",
      to: payload.email,
      subject: "Application Received — Kevo Nails Academy",
      applicationId: application.id,
      html: applicationApplicantEmailHtml({
        fullName: payload.fullName,
        courseName: course.title,
        intakeName: intake.name,
        applicationRef: application.applicationRef,
        status: application.status,
      }),
    });
  }

  return NextResponse.json({
    applicationRef: application.applicationRef,
    courseName: course.title,
    intakeName: intake.name,
  });
}
