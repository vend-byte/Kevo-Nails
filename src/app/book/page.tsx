import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BookingForm from "./BookingForm";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book a nail appointment online at Kevo Nails Academy — choose your service, date and time.",
};

export default async function BookPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    select: { id: true, name: true, category: true, priceKsh: true, durationMins: true },
  });

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Book an Appointment</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Choose your service, pick a date, and select an available time.
          </p>
        </div>

        <div className="mt-12">
          {services.length === 0 ? (
            <p className="text-center text-white/50">
              No services are available for booking yet. Please contact us on WhatsApp.
            </p>
          ) : (
            <BookingForm services={services} />
          )}
        </div>
      </div>
    </main>
  );
}
