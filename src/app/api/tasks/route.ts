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

  // Only filter by assignee if explicitly requested (for admin/manager filtering)
  // Employees can see all tasks in a project
  if (assigneeId) {
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
  if (!body.name || !body.projectId || !Array.isArray(body.assignees)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Add initial activity log
  const displayName = session.user.name || session.user.email || "Unknown user";
  const activity = [
    {
      type: "created",
      user: session.user.id,
      message: `Task created by ${displayName}`,
      createdAt: new Date(),
    },
  ];

  // Convert string dates to Date objects for checklist items
  let checklist = body.checklist || [];
  if (Array.isArray(checklist)) {
    checklist = checklist.map(
      (item: { createdAt: string | Date; checkedAt?: string | Date; [key: string]: unknown }) => ({
        ...item,
        createdAt: typeof item.createdAt === "string" ? new Date(item.createdAt) : item.createdAt,
        checkedAt: item.checkedAt
          ? typeof item.checkedAt === "string"
            ? new Date(item.checkedAt)
            : item.checkedAt
          : undefined,
      })
    );
  }

  // Convert string dates to Date objects for comments
  let comments = body.comments || [];
  if (Array.isArray(comments)) {
    comments = comments.map((comment: { createdAt: string | Date; [key: string]: unknown }) => ({
      ...comment,
      createdAt: typeof comment.createdAt === "string" ? new Date(comment.createdAt) : comment.createdAt,
    }));
  }

  // Convert string dates to Date objects for attachments
  let attachments = body.attachments || [];
  if (Array.isArray(attachments)) {
    attachments = attachments.map((attachment: { uploadedAt: string | Date; [key: string]: unknown }) => ({
      ...attachment,
      uploadedAt: typeof attachment.uploadedAt === "string" ? new Date(attachment.uploadedAt) : attachment.uploadedAt,
    }));
  }

  // Prevent duplicate assignees
  let assignees = body.assignees || [];
  if (Array.isArray(assignees)) {
    assignees = [...new Set(assignees)]; // Remove duplicates
  }

  const task = await Task.create({
    name: body.name,
    projectId: body.projectId,
    description: body.description,
    assignees,
    status: body.status || "todo",
    dueDate: body.dueDate,
    isActive: body.isActive !== undefined ? body.isActive : true,
    checklist,
    activity,
    comments,
    attachments,
  });
  return NextResponse.json(task, { status: 201 });
}
