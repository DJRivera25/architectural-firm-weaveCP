import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import TimeLog from "@/models/TimeLog";
import Task from "@/models/Task";
import Project from "@/models/Project";

interface TaskDetail {
  _id: string;
  name: string;
  status: string;
  projectId?: { name: string };
}

interface PopulatedTaskId {
  _id: { toString(): string };
  name: string;
  projectId: { toString(): string };
  status: string;
}

interface PopulatedProjectId {
  _id: { toString(): string };
  name: string;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const url = request.nextUrl;
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const userId = url.searchParams.get("userId") || session.user.id;
  const projectId = url.searchParams.get("projectId");

  // Validate date parameters
  if (!startDate || !endDate) {
    return NextResponse.json({ error: "startDate and endDate are required" }, { status: 400 });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of day

    // Build filter
    const filter: Record<string, unknown> = {
      userId,
      startTime: { $gte: start, $lte: end },
    };

    // Add project filter if projectId is provided
    if (projectId) {
      filter.projectId = projectId;
    }

    // Get time logs for the date range
    const timeLogs = await TimeLog.find(filter)
      .populate("taskId", "name projectId status")
      .populate("projectId", "name")
      .sort({ startTime: 1 });

    // Calculate daily breakdown
    const dailyBreakdown = new Map<string, { hours: number; tasks: Set<string> }>();
    const taskBreakdown = new Map<string, { name: string; hours: number; projectName: string }>();
    let totalHours = 0;

    timeLogs.forEach((log) => {
      const date = log.startTime.toISOString().split("T")[0];
      const hours = (log.duration || 0) / 3600; // Convert seconds to hours
      totalHours += hours;

      // Daily breakdown
      if (!dailyBreakdown.has(date)) {
        dailyBreakdown.set(date, { hours: 0, tasks: new Set() });
      }
      const daily = dailyBreakdown.get(date)!;
      daily.hours += hours;
      if (log.taskId) {
        const taskIdStr =
          typeof log.taskId === "object" && log.taskId && "_id" in log.taskId
            ? (log.taskId as unknown as PopulatedTaskId)._id.toString()
            : (log.taskId as { toString(): string }).toString();
        daily.tasks.add(taskIdStr);
      }

      // Task breakdown
      if (log.taskId) {
        // Handle both ObjectId and populated object
        let taskId: string;
        if (typeof log.taskId === "object" && log.taskId && "_id" in log.taskId) {
          taskId = (log.taskId as unknown as PopulatedTaskId)._id.toString();
        } else {
          taskId = (log.taskId as { toString(): string }).toString();
        }

        const taskName =
          log.taskId && typeof log.taskId === "object" && "name" in log.taskId
            ? (log.taskId as { name: string }).name
            : "Unknown Task";
        const projectName =
          log.projectId && typeof log.projectId === "object" && "name" in log.projectId
            ? (log.projectId as { name: string }).name
            : "Unknown Project";

        if (!taskBreakdown.has(taskId)) {
          taskBreakdown.set(taskId, { name: taskName, hours: 0, projectName });
        }
        taskBreakdown.get(taskId)!.hours += hours;
      }
    });

    // Convert to arrays and sort
    const dailyData = Array.from(dailyBreakdown.entries())
      .map(([date, data]) => ({
        date,
        hours: Math.round(data.hours * 100) / 100,
        tasks: data.tasks.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const taskData = Array.from(taskBreakdown.entries())
      .map(([taskId, data]) => ({
        taskId,
        taskName: data.name,
        projectName: data.projectName,
        hours: Math.round(data.hours * 100) / 100,
        percentage: Math.round((data.hours / totalHours) * 100),
      }))
      .sort((a, b) => b.hours - a.hours);

    // Get task details for the table
    const taskDetails = await Task.find({
      _id: { $in: Array.from(taskBreakdown.keys()) },
    })
      .populate("projectId", "name")
      .lean();

    const taskDetailsWithHours = taskDetails.map((task) => {
      const taskData = task as unknown as TaskDetail;
      const taskBreakdownData = taskBreakdown.get(taskData._id.toString());
      return {
        taskId: taskData._id.toString(),
        taskName: taskData.name,
        projectName:
          taskData.projectId && typeof taskData.projectId === "object" && "name" in taskData.projectId
            ? (taskData.projectId as { name: string }).name
            : "Unknown Project",
        status: taskData.status,
        totalHours: taskBreakdownData?.hours || 0,
        lastWorked:
          timeLogs
            .filter((log) => log.taskId?.toString() === taskData._id.toString())
            .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0]?.startTime || null,
      };
    });

    const summary = {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalTasks: taskBreakdown.size,
        averageDailyHours: dailyData.length > 0 ? Math.round((totalHours / dailyData.length) * 100) / 100 : 0,
      },
      dailyBreakdown: dailyData,
      taskBreakdown: taskData,
      taskDetails: taskDetailsWithHours,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching time summary:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        error: "Failed to fetch summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
