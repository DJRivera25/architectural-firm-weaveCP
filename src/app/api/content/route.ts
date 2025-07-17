import { NextRequest, NextResponse } from "next/server";
import Content from "@/models/Content";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await connectDB();
  const section = request.nextUrl.searchParams.get("section");
  const filter = section ? { section } : {};
  const content = await Content.find(filter);
  return NextResponse.json(content);
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
  const body = await request.json();
  const content = await Content.create(body);
  return NextResponse.json(content, { status: 201 });
}
