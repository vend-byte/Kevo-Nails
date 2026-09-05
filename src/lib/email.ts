import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import type { EmailType } from "@prisma/client";

// Falls back to the real production domain (never localhost) if the
// environment variable is somehow blank on the deployed server — this
// is what admin dashboard links in emails use, so a missing/blank env
// var can never accidentally send a client to "localhost".
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kevoonails.co.ke";

/**
 * Email service abstraction.
 * Swap the transporter implementation here to change providers
 * (SMTP, Resend, SendGrid, etc.) without touching call sites.
 */
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

interface SendEmailInput {
  type: EmailType;
  to: string;
  subject: string;
  html: string;
  applicationId?: string;
}

/**
 * Sends an email and always records the attempt in EmailLog.
 * NEVER throws — a failed send must not prevent the calling flow
 * (e.g. application submission) from completing, because the
 * database record is the source of truth, not the email.
 */
export async function sendEmail({ type, to, subject, html, applicationId }: SendEmailInput) {
  const log = await prisma.emailLog.create({
    data: { type, toAddress: to, subject, applicationId, status: "PENDING" },
  });

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "SENT" },
    });
    return { ok: true as const };
  } catch (error) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown email error",
      },
    });
    return { ok: false as const, error };
  }
}

export function applicationAdminEmailHtml(app: {
  fullName: string;
  phone: string;
  email?: string | null;
  courseName: string;
  intakeName: string;
  applicationRef: string;
  createdAt: Date;
}) {
  return `
    <h2>New Student Application — Kevo Nails Academy</h2>
    <p>New application received</p>
    <p><strong>Applicant:</strong> ${app.fullName}</p>
    <p><strong>Phone:</strong> ${app.phone}</p>
    <p><strong>Email:</strong> ${app.email ?? "Not provided"}</p>
    <p><strong>Course:</strong> ${app.courseName}</p>
    <p><strong>Intake:</strong> ${app.intakeName}</p>
    <p><strong>Application Reference:</strong> ${app.applicationRef}</p>
    <p><strong>Date:</strong> ${app.createdAt.toLocaleString()}</p>
    <p><a href="${SITE_URL}/admin/applications">View in Admin Dashboard</a></p>
  `;
}

export function applicationApplicantEmailHtml(app: {
  fullName: string;
  courseName: string;
  intakeName: string;
  applicationRef: string;
  status: string;
}) {
  return `
    <h2>Application Received — Kevo Nails Academy</h2>
    <p>Hi ${app.fullName},</p>
    <p>Thank you for applying to Kevo Nails Academy. Your application has been received and saved.</p>
    <p><strong>Reference:</strong> ${app.applicationRef}</p>
    <p><strong>Course:</strong> ${app.courseName}</p>
    <p><strong>Intake:</strong> ${app.intakeName}</p>
    <p><strong>Status:</strong> ${app.status}</p>
    <p>We will contact you after reviewing your application. For questions, reach us on WhatsApp at 0702078249.</p>
  `;
}

export function bookingAdminEmailHtml(booking: {
  customerName: string;
  phone: string;
  email?: string | null;
  serviceName: string;
  date: string;
  time: string;
  bookingRef: string;
  notes?: string | null;
}) {
  return `
    <h2>New Appointment Booking — Kevo Nails Academy</h2>
    <p>New booking received</p>
    <p><strong>Customer:</strong> ${booking.customerName}</p>
    <p><strong>Phone:</strong> ${booking.phone}</p>
    <p><strong>Email:</strong> ${booking.email ?? "Not provided"}</p>
    <p><strong>Service:</strong> ${booking.serviceName}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
    <p><strong>Booking Reference:</strong> ${booking.bookingRef}</p>
    ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ""}
    <p><a href="${SITE_URL}/admin/appointments">View in Admin Dashboard</a></p>
  `;
}

export function bookingCustomerEmailHtml(booking: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  bookingRef: string;
}) {
  return `
    <h2>Booking Received — Kevo Nails Academy</h2>
    <p>Hi ${booking.customerName},</p>
    <p>Thank you for booking with Kevo Nails Academy. Your appointment request has been received.</p>
    <p><strong>Reference:</strong> ${booking.bookingRef}</p>
    <p><strong>Service:</strong> ${booking.serviceName}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
    <p>Your appointment is currently pending confirmation. We'll be in touch shortly. For questions, reach us on WhatsApp at 0702078249.</p>
  `;
}

const STATUS_COPY: Record<string, { subject: string; heading: string; body: string }> = {
  UNDER_REVIEW: {
    subject: "Your Application is Under Review — Kevo Nails Academy",
    heading: "Application Under Review",
    body: "Your application is now being reviewed by our team. We'll be in touch soon with an update.",
  },
  ACCEPTED: {
    subject: "You're In! Application Accepted — Kevo Nails Academy",
    heading: "Congratulations — You've Been Accepted!",
    body: "Great news! Your application has been accepted. Our team will contact you shortly with next steps to secure your place, including any enrollment or payment details.",
  },
  WAITLISTED: {
    subject: "Application Update — Waitlisted — Kevo Nails Academy",
    heading: "You've Been Waitlisted",
    body: "Thank you for your patience. This intake is currently full, so your application has been placed on our waitlist. We'll contact you immediately if a spot opens up.",
  },
  REJECTED: {
    subject: "Application Update — Kevo Nails Academy",
    heading: "Application Update",
    body: "Thank you for your interest in Kevo Nails Academy. After review, we're unable to offer you a place in this intake. We encourage you to apply again for a future intake.",
  },
};

export function applicationStatusUpdateEmailHtml(app: {
  fullName: string;
  courseName: string;
  intakeName: string;
  applicationRef: string;
  status: string;
}) {
  const copy = STATUS_COPY[app.status];
  if (!copy) return null;

  return `
    <h2>${copy.heading} — Kevo Nails Academy</h2>
    <p>Hi ${app.fullName},</p>
    <p>${copy.body}</p>
    <p><strong>Reference:</strong> ${app.applicationRef}</p>
    <p><strong>Course:</strong> ${app.courseName}</p>
    <p><strong>Intake:</strong> ${app.intakeName}</p>
    <p>For questions, reach us on WhatsApp at 0702078249.</p>
  `;
}

const BOOKING_STATUS_COPY: Record<string, { subject: string; heading: string; body: string }> = {
  CONFIRMED: {
    subject: "Your Appointment is Confirmed — Kevo Nails Academy",
    heading: "Appointment Confirmed",
    body: "Your appointment has been confirmed. We look forward to seeing you!",
  },
  RESCHEDULED: {
    subject: "Your Appointment Has Been Rescheduled — Kevo Nails Academy",
    heading: "Appointment Rescheduled",
    body: "Your appointment has been rescheduled. Please see the updated details below.",
  },
  CANCELLED: {
    subject: "Your Appointment Was Cancelled — Kevo Nails Academy",
    heading: "Appointment Cancelled",
    body: "Your appointment has been cancelled. If this wasn't expected, please reach out on WhatsApp and we'll sort it out.",
  },
};

export function bookingStatusUpdateEmailHtml(booking: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  bookingRef: string;
  status: string;
}) {
  const copy = BOOKING_STATUS_COPY[booking.status];
  if (!copy) return null;

  return `
    <h2>${copy.heading} — Kevo Nails Academy</h2>
    <p>Hi ${booking.customerName},</p>
    <p>${copy.body}</p>
    <p><strong>Reference:</strong> ${booking.bookingRef}</p>
    <p><strong>Service:</strong> ${booking.serviceName}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
    <p>For questions, reach us on WhatsApp at 0702078249.</p>
  `;
}

export function adminPasswordResetEmailHtml({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return `
    <h2>Password Reset — Kevo Nails Academy Admin</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your Kevo Nails Academy admin account.</p>
    <p><a href="${resetUrl}">Click here to reset your password</a></p>
    <p>This link will expire in 1 hour and can only be used once.</p>
    <p>If you did not request this, you can safely ignore this email — your password will not be changed.</p>
  `;
}
