import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Edit Service</h1>
      <div className="mt-8">
        <ServiceForm
          initial={{
            id: service.id,
            name: service.name,
            category: service.category ?? "",
            description: service.description ?? "",
            priceKsh: service.priceKsh,
            durationMins: service.durationMins,
            isActive: service.isActive,
          }}
        />
      </div>
    </div>
  );
}
