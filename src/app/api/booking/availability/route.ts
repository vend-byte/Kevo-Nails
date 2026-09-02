import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/booking";

export async function GET(request: NextRequest) {
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const date = request.nextUrl.searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json(
      { error: "serviceId and date are required." },
      { status: 400 }
    );
  }

  try {
    const result = await getAvailableSlots({ serviceId, date });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Availability lookup failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please contact us on WhatsApp." },
      { status: 500 }
    );
  }
}
