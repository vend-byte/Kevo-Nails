import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteStaffButton from "./DeleteStaffButton";
import ToggleActiveButton from "./ToggleActiveButton";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff Management</h1>
        <Link
          href="/admin/staff/new"
          className="rounded-full bg-brand-blue-light px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Add Staff
        </Link>
      </div>

      {staff.length === 0 ? (
        <p className="text-white/50">No staff members yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.fullName} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs">
                          {s.fullName.charAt(0)}
                        </div>
                      )}
                      {s.fullName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{s.whatsapp}</td>
                  <td className="px-4 py-3 text-white/70">{s.role || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        s.isActive
                          ? "rounded-full bg-green-500/15 px-2.5 py-1 text-xs text-green-300"
                          : "rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/50"
                      }
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/staff/${s.id}/edit`} className="text-brand-blue-light hover:opacity-80">
                        Edit
                      </Link>
                      <ToggleActiveButton
                        id={s.id}
                        fullName={s.fullName}
                        whatsapp={s.whatsapp}
                        role={s.role}
                        bio={s.bio}
                        isActive={s.isActive}
                      />
                      <DeleteStaffButton id={s.id} name={s.fullName} />
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
