import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StaffForm from "@/components/admin/StaffForm";

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({ where: { id } });
  if (!staff) notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Edit Staff Member</h1>
      <div className="mt-8">
        <StaffForm staff={staff} />
      </div>
    </div>
  );
}
