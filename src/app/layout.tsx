import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kevo Nails Academy | Nail Services & Nail Training",
    template: "%s | Kevo Nails Academy",
  },
  description:
    "Kevo Nails Academy offers professional nail services — manicure, pedicure, gel, acrylic and nail art — plus hands-on nail technician training. Where Passion Meets Precision.",
  openGraph: {
    type: "website",
    siteName: "Kevo Nails Academy",
    title: "Kevo Nails Academy | Nail Services & Nail Training",
    description: "Where Passion Meets Precision.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kevo Nails Academy",
    description: "Where Passion Meets Precision.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
