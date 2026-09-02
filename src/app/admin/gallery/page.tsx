import { prisma } from "@/lib/prisma";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Gallery / Media Library</h1>
      <GalleryManager
        images={images.map((i) => ({
          id: i.id,
          url: i.url,
          category: i.category,
          altText: i.altText,
          isFeatured: i.isFeatured,
          isPublished: i.isPublished,
        }))}
      />
    </div>
  );
}
