import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteServiceButton from "./DeleteServiceButton";

function formatKsh(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Service
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="text-white/50">No services yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-white/60">{s.category ?? "—"}</td>
                  <td className="px-4 py-3">{formatKsh(s.priceKsh)}</td>
                  <td className="px-4 py-3">{s.durationMins} mins</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        s.isActive ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/40"
                      }`}
                    >
                      {s.isActive ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="text-xs text-brand-blue-light hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteServiceButton serviceId={s.id} />
                    </div>
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
