import { NextRequest, NextResponse } from "next/server";
import TimeLog from "@/models/TimeLog";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const timelog = await TimeLog.findById(params.id);
  if (!timelog) return NextResponse.json({ error: "TimeLog not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    session.user.role !== "manager" &&
    timelog.userId.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  Object.assign(timelog, body);
  await timelog.save();
  return NextResponse.json(timelog);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const timelog = await TimeLog.findById(params.id);
  if (!timelog) return NextResponse.json({ error: "TimeLog not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    session.user.role !== "manager" &&
    timelog.userId.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await timelog.deleteOne();
  return NextResponse.json({ success: true });
}
