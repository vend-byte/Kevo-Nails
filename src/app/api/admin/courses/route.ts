import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const courseSchema = z.object({
  title: z.string().trim().min(2).max(150),
  summary: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  durationText: z.string().trim().max(60).optional(),
  priceKsh: z.coerce.number().int().positive().optional(),
  requirements: z.string().trim().max(1000).optional(),
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
    payload = courseSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Please check the course details." }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: { ...payload, slug: slugify(payload.title) },
  });

  return NextResponse.json(course);
}
