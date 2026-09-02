import ServiceForm from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Add Service</h1>
      <div className="mt-8">
        <ServiceForm />
      </div>
    </div>
  );
}
