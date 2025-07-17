import { NextRequest, NextResponse } from "next/server";
import Leave from "@/models/Leave";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const leave = await Leave.findById(params.id).populate("userId", "name email").populate("approvedBy", "name");

  if (!leave) {
    return NextResponse.json({ error: "Leave not found" }, { status: 404 });
  }

  // Check if user can access this leave
  if (session.user.role === "employee" && leave.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Transform the data to match LeaveWithUser interface
  const transformedLeave = {
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
  };

  return NextResponse.json(transformedLeave);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const leave = await Leave.findById(params.id);

  if (!leave) {
    return NextResponse.json({ error: "Leave not found" }, { status: 404 });
  }

  const body = await request.json();

  // Only managers and admins can approve/reject leaves
  if (body.status && ["approved", "rejected"].includes(body.status)) {
    if (session.user.role !== "admin" && session.user.role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update approval info
    body.approvedBy = session.user.id;
    body.approvedAt = new Date();
  }

  // Employees can only update their own pending leaves
  if (session.user.role === "employee") {
    if (leave.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (leave.status !== "pending") {
      return NextResponse.json({ error: "Cannot update approved/rejected leave" }, { status: 400 });
    }
  }

  const updatedLeave = await Leave.findByIdAndUpdate(params.id, body, { new: true })
    .populate("userId", "name email")
    .populate("approvedBy", "name");

  // Transform the data to match LeaveWithUser interface
  const transformedLeave = {
    _id: updatedLeave._id,
    userId: updatedLeave.userId,
    leaveType: updatedLeave.leaveType,
    startDate: updatedLeave.startDate,
    endDate: updatedLeave.endDate,
    totalDays: updatedLeave.totalDays,
    reason: updatedLeave.reason,
    description: updatedLeave.description,
    status: updatedLeave.status,
    approvedBy: updatedLeave.approvedBy,
    approvedAt: updatedLeave.approvedAt,
    notes: updatedLeave.notes,
    createdAt: updatedLeave.createdAt,
    updatedAt: updatedLeave.updatedAt,
    user: {
      _id: updatedLeave.userId._id,
      name: updatedLeave.userId.name,
      email: updatedLeave.userId.email,
    },
  };

  return NextResponse.json(transformedLeave);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const leave = await Leave.findById(params.id);

  if (!leave) {
    return NextResponse.json({ error: "Leave not found" }, { status: 404 });
  }

  // Only admins and managers can delete leaves, or employees can delete their own pending leaves
  if (session.user.role === "employee") {
    if (leave.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (leave.status !== "pending") {
      return NextResponse.json({ error: "Cannot delete approved/rejected leave" }, { status: 400 });
    }
  }

  await leave.deleteOne();
  return NextResponse.json({ success: true });
}
