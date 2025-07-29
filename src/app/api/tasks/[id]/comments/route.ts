import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function isAssigneeId(obj: unknown): obj is { toString: () => string } {
  return typeof obj === "object" && obj !== null && typeof (obj as { toString: unknown }).toString === "function";
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const task = await Task.findById(params.id).select("comments assignees");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (
    session.user.role === "employee" &&
    !task.assignees.some((a: unknown) => isAssigneeId(a) && a.toString() === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(task.comments);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const task = await Task.findById(params.id).select("assignees comments");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (
    session.user.role === "employee" &&
    !task.assignees.some((a: unknown) => isAssigneeId(a) && a.toString() === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { text } = await request.json();
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Comment text required" }, { status: 400 });
  }
  const comment = {
    user: session.user.id,
    text: text.trim(),
    createdAt: new Date(),
  };
  task.comments.push(comment);
  await task.save();
  return NextResponse.json(comment, { status: 201 });
}
