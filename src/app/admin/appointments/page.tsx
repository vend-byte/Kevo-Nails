import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusSelect from "./StatusSelect";

export default async function AdminAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    include: { customer: true, service: true },
    orderBy: { startTime: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <Link
          href="/admin/appointments/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Booking
        </Link>
      </div>

      {appointments.length === 0 ? (
        <p className="text-white/50">No appointments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{apt.bookingRef}</td>
                  <td className="px-4 py-3">
                    <p>{apt.customer.fullName}</p>
                    <p className="text-xs text-white/40">{apt.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">{apt.service.name}</td>
                  <td className="px-4 py-3">{apt.date.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3">{apt.startTime.toISOString().slice(11, 16)}</td>
                  <td className="px-4 py-3">
                    <StatusSelect appointmentId={apt.id} currentStatus={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
