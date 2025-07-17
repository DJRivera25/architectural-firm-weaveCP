import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
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
  const projectId = url.searchParams.get("projectId");
  const assigneeId = url.searchParams.get("assigneeId");
  const filter: Record<string, unknown> = {};
  if (projectId) filter.projectId = projectId;
  if (session.user.role === "employee") {
    filter.assignees = session.user.id;
  } else if (assigneeId) {
    filter.assignees = assigneeId;
  }
  const tasks = await Task.find(filter);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await request.json();
  if (!body.name || !body.projectId || !Array.isArray(body.assignees) || body.assignees.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const task = await Task.create({
    name: body.name,
    projectId: body.projectId,
    description: body.description,
    assignees: body.assignees,
    status: body.status || "todo",
    dueDate: body.dueDate,
    isActive: body.isActive !== undefined ? body.isActive : true,
  });
  return NextResponse.json(task, { status: 201 });
}
