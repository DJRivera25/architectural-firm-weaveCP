import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const task = await Task.findById(params.id).populate("assignees", "_id name").populate("projectId", "_id name");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  function isAssignee(obj: unknown): obj is { _id: { toString: () => string } } {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "_id" in obj &&
      typeof (obj as { _id: unknown })._id === "object" &&
      (obj as { _id: { toString: unknown } })._id !== null &&
      typeof (obj as { _id: { toString: unknown } })._id.toString === "function"
    );
  }
  if (
    session.user.role === "employee" &&
    !task.assignees.some((a: unknown) => isAssignee(a) && a._id.toString() === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await request.json();
  // Validate fields if present
  if (body.assignees && (!Array.isArray(body.assignees) || body.assignees.length === 0)) {
    return NextResponse.json({ error: "Assignees must be a non-empty array" }, { status: 400 });
  }
  if (body.status && !["todo", "in-progress", "done", "active", "completed", "paused"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }
  const task = await Task.findByIdAndUpdate(params.id, body, { new: true });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const task = await Task.findByIdAndDelete(params.id);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
