import { prisma } from "./prisma";

/**
 * Builds the chatbot's system prompt using CURRENT data pulled from
 * Neon at request time — prices, hours, intakes, courses, FAQs — so the
 * assistant never answers from stale hard-coded values. It is explicitly
 * told not to invent facts and to escalate to WhatsApp when unsure.
 */
export async function buildChatbotContext() {
  const [services, courses, intakes, hours, settings, faqs] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.course.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.intake.findMany({
      where: { status: { in: ["UPCOMING", "OPEN"] } },
      include: { courses: { include: { course: true } } },
      orderBy: { registrationOpens: "asc" },
    }),
    prisma.businessHour.findMany({ orderBy: { weekday: "asc" } }),
    prisma.websiteSetting.findFirst(),
    prisma.fAQ.findMany({ where: { isActive: true } }),
  ]);

  const servicesText = services
    .map((s) => `- ${s.name} (${s.category ?? "General"}): KSh ${s.priceKsh}, ${s.durationMins} mins`)
    .join("\n");

  const coursesText = courses
    .map((c) => `- ${c.title}: ${c.durationText ?? "duration TBC"}${c.priceKsh ? `, KSh ${c.priceKsh}` : ""}`)
    .join("\n");

  const intakesText = intakes
    .map(
      (i) =>
        `- ${i.name} [${i.status}] — registration closes ${
          i.registrationCloses?.toDateString() ?? "TBC"
        }, training starts ${i.trainingStarts?.toDateString() ?? "TBC"}. Courses: ${i.courses
          .map((ic) => ic.course.title)
          .join(", ")}`
    )
    .join("\n");

  const hoursText = hours
    .map((h) => `- ${h.weekday}: ${h.isOpen ? `${h.openTime}–${h.closeTime}` : "Closed"}`)
    .join("\n");

  const faqText = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");

  return `
You are "Kevo Nails Assistant", the official chatbot for ${settings?.businessName ?? "Kevo Nails Academy"}.
Slogan: ${settings?.slogan ?? "Where Passion Meets Precision"}.
WhatsApp / Phone: ${settings?.whatsapp ?? "0702078249"}.

RULES:
- Only use the verified business information provided below. Never invent prices, hours, courses, intakes, addresses, staff, or promises.
- If you do not have enough verified information to answer confidently, say exactly:
  "I don't have enough information to answer that accurately. You can speak directly with Kevo Nails Academy on WhatsApp for assistance."
  and direct them to WhatsApp ${settings?.whatsapp ?? "0702078249"}.
- Never promise a confirmed appointment — only a successful booking through the booking flow confirms an appointment.
- Where relevant, tell the user which page/action to use next (Book Appointment, View Services, View Courses, View Intakes, Apply Now, View Gallery, Contact Us, WhatsApp Us) so the UI can render the matching button.
- Be warm, concise, and professional, consistent with a premium beauty/training brand.

CURRENT SERVICES:
${servicesText || "No services published yet."}

CURRENT COURSES:
${coursesText || "No courses published yet."}

CURRENT INTAKES:
${intakesText || "No open intakes published yet."}

BUSINESS HOURS:
${hoursText || "Not configured yet."}

FAQS:
${faqText || "None yet."}
`.trim();
}
