import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
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

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  // Get the task to check permissions
  const task = await Task.findById(params.id).populate("assignees", "_id name");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Debug: Log task assignees and session user
  console.log("Task PATCH Debug:", {
    taskId: params.id,
    taskAssignees: task.assignees,
    sessionUserId: session.user.id,
    sessionUserRole: session.user.role,
    bodyFields: Object.keys(body),
  });

  // Check if user is assigned to the task
  const isAssigned = task.assignees?.some((assignee: unknown) => {
    if (typeof assignee === "string") {
      return assignee === session.user.id;
    }
    if (typeof assignee === "object" && assignee !== null && "_id" in assignee) {
      // Handle ObjectId comparison - convert both to strings
      const assigneeId = (assignee as { _id: { toString: () => string } })._id.toString();
      return assigneeId === session.user.id;
    }
    return false;
  });

  console.log("Assignment check result:", { isAssigned });

  // Employees can only update status, attachments, and checklists of tasks they are assigned to
  if (session.user.role === "employee") {
    if (!isAssigned) {
      return NextResponse.json({ error: "Forbidden - You are not assigned to this task" }, { status: 403 });
    }

    // Employees can only update status, attachments, and checklists
    const allowedFields = ["status", "attachments", "checklist"];
    const hasUnauthorizedFields = Object.keys(body).some((key) => !allowedFields.includes(key));
    if (hasUnauthorizedFields) {
      return NextResponse.json(
        { error: "Forbidden - Employees can only update task status, attachments, and checklists" },
        { status: 403 }
      );
    }
  } else if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate fields if present
  if (body.assignees && !Array.isArray(body.assignees)) {
    return NextResponse.json({ error: "Assignees must be an array" }, { status: 400 });
  }
  if (body.status && !["todo", "in-progress", "done", "active", "completed", "paused"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  // Activity log logic
  const activity = task.activity || [];
  const now = new Date();
  const user = session.user.id;
  const displayName = session.user.name || session.user.email || "Unknown user";

  if (body.status && body.status !== task.status) {
    activity.push({
      type: "status_changed",
      user,
      message: `${displayName} changed status from ${task.status} to ${body.status}`,
      createdAt: now,
    });
  }

  if (
    body.assignees &&
    JSON.stringify(body.assignees) !==
      JSON.stringify(
        task.assignees.map((a: unknown) =>
          typeof a === "string"
            ? a
            : typeof a === "object" &&
              a !== null &&
              "toString" in a &&
              typeof (a as { toString: () => string }).toString === "function"
            ? (a as { toString: () => string }).toString()
            : ""
        )
      )
  ) {
    activity.push({
      type: "assigned",
      user,
      message: `${displayName} updated assignees`,
      createdAt: now,
    });
  }

  if (body.checklist && JSON.stringify(body.checklist) !== JSON.stringify(task.checklist)) {
    activity.push({
      type: "checklist_updated",
      user,
      message: `${displayName} updated the checklist`,
      createdAt: now,
    });
  }

  if (body.comments && JSON.stringify(body.comments) !== JSON.stringify(task.comments)) {
    activity.push({
      type: "comment",
      user,
      message: `${displayName} added or updated a comment`,
      createdAt: now,
    });
  }

  if (body.attachments && JSON.stringify(body.attachments) !== JSON.stringify(task.attachments)) {
    activity.push({
      type: "attachment",
      user,
      message: `${displayName} added or removed attachment(s)`,
      createdAt: now,
    });
  }

  // Merge activity into update
  const update = { ...body, activity };

  // Prevent duplicate assignees
  if (update.assignees && Array.isArray(update.assignees)) {
    update.assignees = [...new Set(update.assignees)]; // Remove duplicates
  }

  // Convert string dates to Date objects for checklist items
  if (update.checklist && Array.isArray(update.checklist)) {
    update.checklist = update.checklist.map(
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
  if (update.comments && Array.isArray(update.comments)) {
    update.comments = update.comments.map((comment: { createdAt: string | Date; [key: string]: unknown }) => ({
      ...comment,
      createdAt: typeof comment.createdAt === "string" ? new Date(comment.createdAt) : comment.createdAt,
    }));
  }

  // Convert string dates to Date objects for attachments and set uploadedBy to current user if missing
  if (update.attachments && Array.isArray(update.attachments)) {
    update.attachments = update.attachments.map(
      (attachment: { uploadedAt: string | Date; uploadedBy?: string; [key: string]: unknown }) => ({
        ...attachment,
        uploadedAt: typeof attachment.uploadedAt === "string" ? new Date(attachment.uploadedAt) : attachment.uploadedAt,
        uploadedBy: attachment.uploadedBy || user,
      })
    );
  }

  // Convert string dates to Date objects for activity
  if (update.activity && Array.isArray(update.activity)) {
    update.activity = update.activity.map((activity: { createdAt: string | Date; [key: string]: unknown }) => ({
      ...activity,
      createdAt: typeof activity.createdAt === "string" ? new Date(activity.createdAt) : activity.createdAt,
    }));
  }

  const updatedTask = await Task.findByIdAndUpdate(params.id, update, { new: true });
  if (!updatedTask) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  return NextResponse.json(updatedTask);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
