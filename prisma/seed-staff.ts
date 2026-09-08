import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STAFF = [
  { fullName: "Betty Kimathi", whatsapp: "254758511514" },
  { fullName: "Suzan", whatsapp: "254716924827" },
  { fullName: "Tina", whatsapp: "254114383650" },
  { fullName: "Winnie", whatsapp: "254114659275" },
  { fullName: "Karani", whatsapp: "254745953535" },
  { fullName: "Kevin Munene", whatsapp: "254702078249" },
];

async function main() {
  for (const [index, member] of STAFF.entries()) {
    await prisma.staff.upsert({
      where: { whatsapp: member.whatsapp },
      update: {},
      create: { ...member, isActive: true, sortOrder: index },
    });
  }
  console.log(`Seeded ${STAFF.length} staff members.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
