import { NextRequest, NextResponse } from "next/server";
import Leave from "@/models/Leave";
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
  const status = url.searchParams.get("status");

  const filter: Record<string, unknown> = {};

  // Employees can only see their own leaves
  if (session.user.role === "employee") {
    filter.userId = session.user.id;
  } else if (userId) {
    // Managers and admins can filter by user
    filter.userId = userId;
  }

  if (status) {
    filter.status = status;
  }

  const leaves = await Leave.find(filter).populate("userId", "name email").populate("approvedBy", "name");

  // Transform the data to match LeaveWithUser interface
  const transformedLeaves = leaves.map((leave) => ({
    _id: leave._id,
    userId: leave.userId,
    leaveType: leave.leaveType,
    startDate: leave.startDate,
    endDate: leave.endDate,
    totalDays: leave.totalDays,
    reason: leave.reason,
    description: leave.description,
    status: leave.status,
    approvedBy: leave.approvedBy,
    approvedAt: leave.approvedAt,
    notes: leave.notes,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
    user: {
      _id: leave.userId._id,
      name: leave.userId.name,
      email: leave.userId.email,
    },
  }));

  return NextResponse.json(transformedLeaves);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  // Validate required fields
  if (!body.leaveType || !body.startDate || !body.endDate || !body.reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate dates
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (startDate >= endDate) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  if (startDate < new Date()) {
    return NextResponse.json({ error: "Start date cannot be in the past" }, { status: 400 });
  }

  const leave = await Leave.create({
    ...body,
    userId: session.user.id,
    status: "pending",
  });

  return NextResponse.json(leave, { status: 201 });
}
