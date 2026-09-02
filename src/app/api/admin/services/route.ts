import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  priceKsh: z.coerce.number().int().positive(),
  durationMins: z.coerce.number().int().positive(),
  isActive: z.boolean().default(true),
});

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function POST(request: NextRequest) {
  let payload;
  try {
    payload = serviceSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the service details." }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      ...payload,
      slug: slugify(payload.name),
    },
  });

  return NextResponse.json(service);
}
