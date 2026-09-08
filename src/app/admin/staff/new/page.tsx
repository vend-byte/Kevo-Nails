import StaffForm from "@/components/admin/StaffForm";

export default function NewStaffPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Add Staff Member</h1>
      <div className="mt-8">
        <StaffForm />
      </div>
    </div>
  );
}
