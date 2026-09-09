import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusSelect from "./StatusSelect";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ staff?: string }>;
}) {
  const { staff: staffFilter } = await searchParams;

  const [appointments, staffList, whatsappLogs] = await Promise.all([
    prisma.appointment.findMany({
      where: staffFilter && staffFilter !== "ALL" ? { staffId: staffFilter } : {},
      include: { customer: true, service: true, staff: true },
      orderBy: { startTime: "desc" },
      take: 100,
    }),
    prisma.staff.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.whatsappBookingLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <Link
          href="/admin/appointments/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Booking
        </Link>
      </div>

      <form className="mb-6 flex items-center gap-3" method="get">
        <label className="text-sm text-white/60">Filter by Staff</label>
        <select
          name="staff"
          defaultValue={staffFilter ?? "ALL"}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand-blue-light"
        >
          <option value="ALL" className="bg-brand-black">All Staff</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id} className="bg-brand-black">
              {s.fullName}
            </option>
          ))}
        </select>
      </form>

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
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
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
                  <td className="px-4 py-3">{apt.staffNameSnapshot ?? apt.staff?.fullName ?? "—"}</td>
                  <td className="px-4 py-3">{apt.date.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3">{apt.startTime.toISOString().slice(11, 16)}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{apt.bookingMethod}</td>
                  <td className="px-4 py-3">
                    <StatusSelect appointmentId={apt.id} currentStatus={apt.status} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      endpoint={`/api/admin/appointments/${apt.id}`}
                      confirmMessage={`Delete the appointment for ${apt.customer.fullName}? This cannot be undone.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {whatsappLogs.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-1 text-lg font-semibold">Pending WhatsApp Confirmations</h2>
          <p className="mb-4 text-xs text-white/40">
            Customers who clicked "Book via WhatsApp" — these have not been confirmed by staff
            and do not hold a time slot.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-white/50">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Requested</th>
                </tr>
              </thead>
              <tbody>
                {whatsappLogs.map((log) => (
                  <tr key={log.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <p>{log.customerName}</p>
                      <p className="text-xs text-white/40">{log.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">{log.serviceName}</td>
                    <td className="px-4 py-3">{log.staffName}</td>
                    <td className="px-4 py-3">{log.date}</td>
                    <td className="px-4 py-3">{log.time}</td>
                    <td className="px-4 py-3">KSh {log.priceKsh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {log.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}