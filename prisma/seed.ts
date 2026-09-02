import { PrismaClient, Weekday } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

// NOTE: All data below is clearly-marked DEMO data for local development.
// Do not present these prices, hours or courses as real business information.

async function main() {
  console.log("Seeding demo data (NOT real business data)...");

  await prisma.websiteSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      businessName: "Kevo Nails Academy",
      phone: "0702078249",
      whatsapp: "0702078249",
      slogan: "Where Passion Meets Precision",
    },
  });

  const weekdays: { day: Weekday; open: string | null; close: string | null }[] = [
    { day: "MONDAY", open: "09:00", close: "18:00" },
    { day: "TUESDAY", open: "09:00", close: "18:00" },
    { day: "WEDNESDAY", open: "09:00", close: "18:00" },
    { day: "THURSDAY", open: "09:00", close: "18:00" },
    { day: "FRIDAY", open: "09:00", close: "18:00" },
    { day: "SATURDAY", open: "09:00", close: "16:00" },
    { day: "SUNDAY", open: null, close: null },
  ];
  for (const w of weekdays) {
    await prisma.businessHour.upsert({
      where: { weekday: w.day },
      update: {},
      create: {
        weekday: w.day,
        isOpen: !!w.open,
        openTime: w.open,
        closeTime: w.close,
      },
    });
  }

  await prisma.service.createMany({
    data: [
      { name: "Classic Pedicure (DEMO)", slug: "classic-pedicure-demo", category: "Pedicure", priceKsh: 1500, durationMins: 60 },
      { name: "Gel Manicure (DEMO)", slug: "gel-manicure-demo", category: "Gel", priceKsh: 2000, durationMins: 75 },
      { name: "Acrylic Extensions (DEMO)", slug: "acrylic-extensions-demo", category: "Extensions", priceKsh: 3000, durationMins: 120 },
    ],
    skipDuplicates: true,
  });

  const course = await prisma.course.upsert({
    where: { slug: "nail-technician-basics-demo" },
    update: {},
    create: {
      title: "Nail Technician Basics (DEMO)",
      slug: "nail-technician-basics-demo",
      durationText: "6 weeks",
      priceKsh: 25000,
      isActive: true,
    },
  });

  const intake = await prisma.intake.create({
    data: {
      name: "October 2026 Intake (DEMO)",
      status: "OPEN",
      registrationCloses: new Date("2026-10-01"),
      trainingStarts: new Date("2026-10-15"),
      courses: { create: [{ courseId: course.id }] },
    },
  });

  const passwordHash = await hashPassword("ChangeMe123!");
  await prisma.adminUser.upsert({
    where: { email: "admin@kevonailsacademy.test" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@kevonailsacademy.test",
      passwordHash,
      role: "OWNER",
    },
  });

  console.log("Done. Demo admin login: admin@kevonailsacademy.test / ChangeMe123!");
  console.log(`Demo intake created: ${intake.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
