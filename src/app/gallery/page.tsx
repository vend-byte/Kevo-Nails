import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import type { GalleryCategory } from "@prisma/client";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Our Work | Nail Photo Gallery",
  description:
    "Browse real nail work from Kevo Nails Academy — pedicure, manicure, gel, acrylic, nail art, extensions and student training photos.",
};

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  PEDICURE: "Pedicure",
  MANICURE: "Manicure",
  NAIL_POLISHING: "Nail Polishing",
  GEL: "Gel",
  ACRYLIC: "Acrylic",
  NAIL_ART: "Nail Art",
  NAIL_EXTENSIONS: "Nail Extensions",
  BEFORE_AFTER: "Before & After",
  STUDENT_WORK: "Student Work",
  TRAINING: "Training",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory =
    category && category.toUpperCase() in CATEGORY_LABELS
      ? (category.toUpperCase() as GalleryCategory)
      : undefined;

  const images = await prisma.galleryImage.findMany({
    where: {
      isPublished: true,
      ...(activeCategory ? { category: activeCategory } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-brand-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.3em] text-brand-blue-light">
            Kevo Nails Academy
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Our Work</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            A look at real nail work and student training from Kevo Nails Academy.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <a
            href="/gallery"
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              !activeCategory
                ? "border-brand-blue-light bg-brand-blue-light text-white"
                : "border-white/20 text-white/70 hover:text-white"
            }`}
          >
            All
          </a>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={`/gallery?category=${key.toLowerCase()}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                activeCategory === key
                  ? "border-brand-blue-light bg-brand-blue-light text-white"
                  : "border-white/20 text-white/70 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {images.length === 0 ? (
          <p className="mt-16 text-center text-white/50">
            No photos published in this category yet. Please check back soon.
          </p>
        ) : (
          <GalleryGrid
            images={images.map((img) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
              categoryLabel: CATEGORY_LABELS[img.category],
            }))}
          />
        )}
      </div>
    </main>
  );
}
