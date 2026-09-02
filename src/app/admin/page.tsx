import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const [todayCount, pendingCount, applicationCount] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: startOfToday, lt: endOfToday } },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "RECEIVED" } }),
  ]);

  const todaysAppointments = await prisma.appointment.findMany({
    where: { date: { gte: startOfToday, lt: endOfToday } },
    include: { customer: true, service: true },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Today's Appointments</p>
          <p className="mt-2 text-3xl font-semibold">{todayCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">Pending Appointments</p>
          <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-white/50">New Applications</p>
          <p className="mt-2 text-3xl font-semibold">{applicationCount}</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Today's Schedule</h2>
          <Link href="/admin/appointments" className="text-sm text-brand-blue-light hover:underline">
            View all appointments →
          </Link>
        </div>

        {todaysAppointments.length === 0 ? (
          <p className="text-white/50">No appointments scheduled for today.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/50">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {todaysAppointments.map((apt) => (
                  <tr key={apt.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      {apt.startTime.toISOString().slice(11, 16)}
                    </td>
                    <td className="px-4 py-3">{apt.customer.fullName}</td>
                    <td className="px-4 py-3">{apt.service.name}</td>
                    <td className="px-4 py-3">{apt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
