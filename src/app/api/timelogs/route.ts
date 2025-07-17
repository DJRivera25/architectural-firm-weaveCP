import { NextRequest, NextResponse } from "next/server";
import TimeLog from "@/models/TimeLog";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const url = request.nextUrl;
  const userId = url.searchParams.get("userId");
  const date = url.searchParams.get("date");

  const filter: Record<string, unknown> = {};

  // Employees can only see their own time logs
  if (session.user.role === "employee") {
    filter.userId = session.user.id;
  } else if (userId) {
    // Managers and admins can filter by user
    filter.userId = userId;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }

  const timelogs = await TimeLog.find(filter).populate("userId", "name email");
  return NextResponse.json(timelogs);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await request.json();
  // Attach userId from session
  const timelog = await TimeLog.create({ ...body, userId: session.user.id });
  return NextResponse.json(timelog, { status: 201 });
}
