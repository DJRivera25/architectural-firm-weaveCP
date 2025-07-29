import { NextRequest, NextResponse } from "next/server";
import TimeLog from "@/models/TimeLog";
import Task from "@/models/Task";
import Project from "@/models/Project";
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
  const taskId = url.searchParams.get("taskId");
  const projectId = url.searchParams.get("projectId");
  const date = url.searchParams.get("date");

  const filter: Record<string, unknown> = {};

  // Employees can only see their own time logs
  if (session.user.role === "employee") {
    filter.userId = session.user.id;
  } else if (userId) {
    // Managers and admins can filter by user
    filter.userId = userId;
  }

  // Filter by task if specified
  if (taskId) {
    filter.taskId = taskId;
  }

  // Filter by project if specified
  if (projectId) {
    filter.projectId = projectId;
  }

  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: start, $lte: end };
  } else if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    filter.startTime = { $gte: startOfDay, $lte: endOfDay };
  }

  const timelogs = await TimeLog.find(filter).populate("userId", "name email").sort({ startTime: -1, createdAt: -1 }); // Latest first
  return NextResponse.json(timelogs);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await request.json();

  console.log("Creating TimeLog with data:", { ...body, userId: session.user.id });

  try {
    // Attach userId from session
    const timelog = await TimeLog.create({ ...body, userId: session.user.id });

    // Update task and project totalTime if duration is provided (manual entries)
    if (body.duration && body.duration > 0) {
      console.log(`Updating task/project totalTime for manual entry:`, {
        taskId: body.taskId,
        projectId: body.projectId,
        duration: body.duration,
      });

      if (body.taskId) {
        await Task.findByIdAndUpdate(body.taskId, {
          $inc: { totalTime: body.duration },
        });
      }

      if (body.projectId) {
        await Project.findByIdAndUpdate(body.projectId, {
          $inc: { totalTime: body.duration },
        });
      }
    }

    return NextResponse.json(timelog, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating TimeLog:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
