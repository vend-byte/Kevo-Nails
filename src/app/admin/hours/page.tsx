import { prisma } from "@/lib/prisma";
import HoursEditor from "./HoursEditor";

const WEEKDAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default async function AdminHoursPage() {
  const hours = await prisma.businessHour.findMany();

  const complete = WEEKDAY_ORDER.map((weekday) => {
    const existing = hours.find((h) => h.weekday === weekday);
    return (
      existing ?? {
        weekday,
        isOpen: false,
        openTime: null,
        closeTime: null,
        breakStart: null,
        breakEnd: null,
      }
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Business Hours</h1>
      <p className="mt-1 text-sm text-white/50">
        Controls what times customers can book online. Changes take effect immediately.
      </p>
      <div className="mt-8 max-w-2xl">
        <HoursEditor initialHours={complete as any} />
      </div>
    </div>
  );
}
