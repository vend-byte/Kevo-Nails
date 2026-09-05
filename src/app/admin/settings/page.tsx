import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.websiteSetting.findFirst();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-white/50">
        Business info and social media links shown across the site — no code changes needed.
      </p>
      <div className="mt-8">
        <SettingsForm
          initial={{
            businessName: settings?.businessName ?? "Kevo Nails Academy",
            phone: settings?.phone ?? "0702078249",
            whatsapp: settings?.whatsapp ?? "0702078249",
            email: settings?.email ?? "",
            location: settings?.location ?? "",
            slogan: settings?.slogan ?? "Where Passion Meets Precision",
            instagramAcademyUrl: settings?.instagramAcademyUrl ?? "",
            instagramSalonUrl: settings?.instagramSalonUrl ?? "",
            tiktokAcademyUrl: settings?.tiktokAcademyUrl ?? "",
            tiktokSalonUrl: settings?.tiktokSalonUrl ?? "",
            facebook: settings?.facebook ?? "",
            whatsappButtonEnabled: settings?.whatsappButtonEnabled ?? true,
            whatsappGlowEnabled: settings?.whatsappGlowEnabled ?? true,
            whatsappDefaultMessage:
              settings?.whatsappDefaultMessage ??
              "Hi Kevo Nails Academy! I'd like to know more about your services.",
            maintenanceMode: settings?.maintenanceMode ?? false,
            maintenanceMessage:
              settings?.maintenanceMessage ??
              "We're currently updating our website. Please check back shortly.",
            aboutText: settings?.aboutText ?? "",
            visionText: settings?.visionText ?? "",
            missionText: settings?.missionText ?? "",
          }}
        />
      </div>
    </div>
  );
}
