import { NextRequest, NextResponse } from "next/server";
import LeaveCredit from "@/models/LeaveCredit";
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
  const year = url.searchParams.get("year") || new Date().getFullYear().toString();
  const leaveType = url.searchParams.get("leaveType");

  const filter: Record<string, unknown> = { year: parseInt(year) };

  // Employees can only see their own credits
  if (session.user.role === "employee") {
    filter.userId = session.user.id;
  } else if (userId) {
    // Managers and admins can filter by user
    filter.userId = userId;
  }

  if (leaveType) {
    filter.leaveType = leaveType;
  }

  const credits = await LeaveCredit.find(filter).populate("userId", "name email");
  return NextResponse.json(credits);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and managers can create leave credits
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await request.json();

  // Validate required fields
  if (!body.userId || !body.year || !body.leaveType || body.totalCredits === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check if credit already exists for this user, year, and leave type
  const existingCredit = await LeaveCredit.findOne({
    userId: body.userId,
    year: body.year,
    leaveType: body.leaveType,
  });

  if (existingCredit) {
    return NextResponse.json(
      { error: "Leave credit already exists for this user, year, and leave type" },
      { status: 400 }
    );
  }

  const credit = await LeaveCredit.create({
    ...body,
    usedCredits: body.usedCredits || 0,
  });

  const populatedCredit = await credit.populate("userId", "name email");

  return NextResponse.json(populatedCredit, { status: 201 });
}
