import { NextRequest, NextResponse } from "next/server";
import TimeLog from "@/models/TimeLog";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const timelog = await TimeLog.findById(params.id);
  if (!timelog) return NextResponse.json({ error: "TimeLog not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    session.user.role !== "manager" &&
    timelog.userId.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const oldDuration = timelog.duration || 0;
  const newDuration = body.duration || 0;
  const durationDiff = newDuration - oldDuration;

  Object.assign(timelog, body);
  await timelog.save();

  // Update task and project totalTime if duration changed
  if (durationDiff !== 0) {
    console.log(`Updating task/project totalTime:`, {
      taskId: timelog.taskId,
      projectId: timelog.projectId,
      oldDuration,
      newDuration,
      durationDiff,
    });

    if (timelog.taskId) {
      await Task.findByIdAndUpdate(timelog.taskId, {
        $inc: { totalTime: durationDiff },
      });
    }

    if (timelog.projectId) {
      await Project.findByIdAndUpdate(timelog.projectId, {
        $inc: { totalTime: durationDiff },
      });
    }
  }

  return NextResponse.json(timelog);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const timelog = await TimeLog.findById(params.id);
  if (!timelog) return NextResponse.json({ error: "TimeLog not found" }, { status: 404 });
  if (
    session.user.role !== "admin" &&
    session.user.role !== "manager" &&
    timelog.userId.toString() !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const duration = timelog.duration || 0;

  // Update task and project totalTime when deleting time log
  if (duration > 0) {
    if (timelog.taskId) {
      await Task.findByIdAndUpdate(timelog.taskId, {
        $inc: { totalTime: -duration },
      });
    }

    if (timelog.projectId) {
      await Project.findByIdAndUpdate(timelog.projectId, {
        $inc: { totalTime: -duration },
      });
    }
  }

  await timelog.deleteOne();
  return NextResponse.json({ success: true });
}
