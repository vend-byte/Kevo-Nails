import { prisma } from "@/lib/prisma";
import MarketingManager from "@/components/admin/MarketingManager";

export default async function AdminMarketingPage() {
  const [banners, announcements, promotions] = await Promise.all([
    prisma.banner.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">Banners, Announcements &amp; Promotions</h1>
      <MarketingManager
        banners={banners.map((b) => ({
          id: b.id,
          title: b.title,
          description: b.description,
          imageUrl: b.imageUrl,
          buttonText: b.buttonText,
          buttonLink: b.buttonLink,
          isActive: b.isActive,
        }))}
        announcements={announcements.map((a) => ({
          id: a.id,
          message: a.message,
          link: a.link,
          isActive: a.isActive,
        }))}
        promotions={promotions.map((p) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          imageUrl: p.imageUrl,
          discountText: p.discountText,
          isActive: p.isActive,
        }))}
      />
    </div>
  );
}
