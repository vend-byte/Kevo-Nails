"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "0702078249").replace(/\D/g, "");
// Kenyan local numbers (07xxxxxxxx) need the country code for wa.me links.
const WHATSAPP_INTL = WHATSAPP_NUMBER.startsWith("0")
  ? `254${WHATSAPP_NUMBER.slice(1)}`
  : WHATSAPP_NUMBER;

export default function WhatsAppButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const message = encodeURIComponent(
    "Hi Kevo Nails Academy! I'd like to know more about your services."
  );

  return (
    <a
      href={`https://wa.me/${WHATSAPP_INTL}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      // Positioned bottom-left so it never overlaps the chatbot (bottom-right).
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.001 3C9.373 3 4 8.373 4 15c0 2.393.7 4.62 1.902 6.492L4 29l7.723-1.867A11.94 11.94 0 0 0 16.001 27C22.628 27 28 21.627 28 15S22.628 3 16.001 3Zm0 21.75a9.7 9.7 0 0 1-4.945-1.354l-.355-.21-4.583 1.108 1.13-4.47-.232-.367A9.71 9.71 0 0 1 6.25 15c0-5.376 4.375-9.75 9.751-9.75S25.75 9.624 25.75 15 21.377 24.75 16.001 24.75Zm5.35-7.297c-.293-.147-1.734-.856-2.003-.954-.269-.098-.465-.147-.66.147-.196.293-.758.954-.929 1.15-.171.196-.343.22-.636.073-.293-.147-1.237-.456-2.356-1.454-.871-.777-1.459-1.737-1.63-2.03-.171-.293-.018-.451.128-.597.132-.131.293-.343.44-.514.147-.171.196-.293.293-.489.098-.196.049-.367-.024-.514-.073-.147-.66-1.591-.905-2.18-.238-.572-.481-.494-.66-.503l-.562-.01c-.196 0-.514.073-.783.367-.269.293-1.026 1.003-1.026 2.446 0 1.443 1.05 2.837 1.196 3.033.147.196 2.066 3.155 5.008 4.423.699.302 1.245.482 1.67.617.702.223 1.341.192 1.846.117.563-.084 1.734-.709 1.978-1.394.245-.685.245-1.271.171-1.394-.073-.122-.269-.196-.562-.343Z" />
      </svg>
    </a>
  );
}
