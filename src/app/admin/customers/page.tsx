import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <p className="mt-1 text-sm text-white/50">
        Everyone who has booked an appointment, most recent first.
      </p>

      {customers.length === 0 ? (
        <p className="mt-8 text-white/50">No customers yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">First Seen</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{c.fullName}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 text-white/60">{c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c._count.appointments}</td>
                  <td className="px-4 py-3 text-xs text-white/50">
                    {c.createdAt.toISOString().slice(0, 10)}
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
