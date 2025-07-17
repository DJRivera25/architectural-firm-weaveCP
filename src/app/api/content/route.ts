import { NextRequest, NextResponse } from "next/server";
import Content from "@/models/Content";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await connectDB();
  const section = request.nextUrl.searchParams.get("section");
  const status = request.nextUrl.searchParams.get("status");
  const filter: Record<string, unknown> = section ? { section } : {};
  if (status === "draft") {
    // For admin preview: return all content with draftData
    const content = await Content.find(filter);
    return NextResponse.json(content.map((c) => ({ ...c.toObject(), data: c.draftData, status: c.status })));
  } else {
    // Default/public: return only published content
    filter.status = "published";
    const content = await Content.find(filter);
    return NextResponse.json(content.map((c) => ({ ...c.toObject(), data: c.publishedData, status: c.status })));
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  try {
    const body = await request.json();
    if (!body.section || typeof body.section !== "string") {
      return NextResponse.json({ error: "Section is required" }, { status: 400 });
    }
    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "Data object is required" }, { status: 400 });
    }
    const content = await Content.create({
      section: body.section,
      draftData: body.data,
      publishedData: body.data, // On create, draft and published are the same
      status: "published",
      order: body.order ?? 0,
      isActive: body.isActive ?? true,
    });
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
