import { NextRequest, NextResponse } from "next/server";
import Content from "@/models/Content";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
    const action = body.action;
    let content;
    if (action === "publish") {
      // Copy draftData to publishedData, set status to published
      content = await Content.findById(params.id);
      if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      content.publishedData = content.draftData;
      content.status = "published";
      await content.save();
    } else if (action === "revert") {
      // Copy publishedData to draftData, set status to published
      content = await Content.findById(params.id);
      if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
      content.draftData = content.publishedData;
      content.status = "published";
      await content.save();
      // Clear draftData after revert
      content.draftData = {};
      await content.save();
    } else {
      // Default: update draftData (save draft)
      const update: Record<string, unknown> = {};
      if (body.draftData && typeof body.draftData === "object") update.draftData = body.draftData;
      if (typeof body.order === "number") update.order = body.order;
      if (typeof body.isActive === "boolean") update.isActive = body.isActive;
      content = await Content.findByIdAndUpdate(params.id, update, { new: true });
      if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }
    return NextResponse.json(content);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  try {
    const content = await Content.findByIdAndDelete(params.id);
    if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectDB();
  const content = await Content.findOne({ section: params.id });
  if (!content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }
  return NextResponse.json(content);
}
