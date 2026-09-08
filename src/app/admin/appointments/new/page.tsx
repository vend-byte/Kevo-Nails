import { prisma } from "@/lib/prisma";
import AdminBookingForm from "./AdminBookingForm";

export const dynamic = "force-dynamic";

export default async function AdminNewBookingPage() {
  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      select: { id: true, name: true, category: true, priceKsh: true, durationMins: true },
    }),
    prisma.staff.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, fullName: true },
    }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Add Booking</h1>
      <p className="mt-1 text-sm text-white/50">
        For bookings taken over WhatsApp or phone — this uses the same availability check
        and double-booking protection as the public booking page.
      </p>

      <div className="mt-8 max-w-xl">
        <AdminBookingForm services={services} staff={staff} />
      </div>
    </div>
  );
}
