import { NextRequest, NextResponse } from "next/server";
import Content from "@/models/Content";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await request.json();
  const content = await Content.findByIdAndUpdate(params.id, body, { new: true });
  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  return NextResponse.json(content);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const content = await Content.findByIdAndDelete(params.id);
  if (!content) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
