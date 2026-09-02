import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nail Services | Manicure, Pedicure & Nail Art",
  description:
    "Explore Kevo Nails Academy's full range of nail services — manicure, pedicure, gel, acrylic, nail art and extensions — with current prices and durations.",
};

function formatKsh(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  const grouped = services.reduce<Record<string, typeof services>>((acc, service) => {
    const key = service.category ?? "Other";
    acc[key] = acc[key] ? [...acc[key], service] : [service];
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Nail Services</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Professional nail care delivered with precision. Prices and durations shown
            here reflect our current published rates.
          </p>
        </div>

        {services.length === 0 ? (
          <p className="mt-16 text-center text-white/50">
            No services are published yet. Please check back soon or contact us on
            WhatsApp for current offerings.
          </p>
        ) : (
          <div className="mt-16 space-y-14">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="mb-6 text-xl font-semibold text-brand-blue-light">
                  {category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        {service.description && (
                          <p className="mt-1 text-sm text-white/60">{service.description}</p>
                        )}
                        <p className="mt-2 text-xs uppercase tracking-wide text-white/40">
                          {service.durationMins} mins
                        </p>
                      </div>
                      <p className="whitespace-nowrap text-lg font-semibold text-brand-blue-light">
                        {formatKsh(service.priceKsh)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <a
            href="/book"
            className="inline-block rounded-full bg-brand-blue-light px-8 py-3 font-medium text-white transition hover:opacity-90"
          >
            Book an Appointment
          </a>
        </div>
      </div>
    </main>
  );
}
