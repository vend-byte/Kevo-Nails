-- AlterEnum
ALTER TYPE "EmailType" ADD VALUE 'ADMIN_PASSWORD_RESET';

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT;

-- AlterTable
ALTER TABLE "WebsiteSetting" ADD COLUMN     "aboutText" TEXT,
ADD COLUMN     "maintenanceMessage" TEXT NOT NULL DEFAULT 'We''re currently updating our website. Please check back shortly.',
ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "missionText" TEXT,
ADD COLUMN     "visionText" TEXT,
ADD COLUMN     "whatsappButtonEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "whatsappDefaultMessage" TEXT NOT NULL DEFAULT 'Hi Kevo Nails Academy! I''d like to know more about your services.',
ADD COLUMN     "whatsappGlowEnabled" BOOLEAN NOT NULL DEFAULT true;
