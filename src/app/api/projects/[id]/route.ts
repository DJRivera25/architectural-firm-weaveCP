import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const project = await Project.findById(params.id).populate("members", "name email role image");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess =
      project.members.some((member: unknown) => {
        const memberObj = member as { _id: unknown };
        return (memberObj._id as unknown as { toString: () => string }).toString() === session.user.id;
      }) ||
      session.user.role === "admin" ||
      session.user.role === "manager";

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const serializedProject = {
      _id: project._id.toString(),
      name: project.name,
      client: project.client,
      description: project.description,
      status: project.status,
      budget: project.budget,
      startDate: project.startDate,
      endDate: project.endDate,
      isActive: project.isActive,
      totalTime: project.totalTime,
      estimatedTime: project.estimatedTime,
      photo: project.photo,
      members: project.members.map((member: unknown) => {
        const memberObj = member as { _id: unknown; name: string; email: string; role: string; image?: string };
        return {
          _id: (memberObj._id as unknown as { toString: () => string }).toString(),
          name: memberObj.name,
          email: memberObj.email,
          role: memberObj.role,
          image: memberObj.image,
        };
      }),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };

    return NextResponse.json(serializedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin and manager can update projects
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const body = await request.json();
    const updatedProject = await Project.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("members", "name email role image");

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const serializedProject = {
      _id: updatedProject._id.toString(),
      name: updatedProject.name,
      client: updatedProject.client,
      description: updatedProject.description,
      status: updatedProject.status,
      budget: updatedProject.budget,
      startDate: updatedProject.startDate,
      endDate: updatedProject.endDate,
      isActive: updatedProject.isActive,
      totalTime: updatedProject.totalTime,
      estimatedTime: updatedProject.estimatedTime,
      photo: updatedProject.photo,
      members: updatedProject.members.map((member: unknown) => {
        const memberObj = member as { _id: unknown; name: string; email: string; role: string; image?: string };
        return {
          _id: (memberObj._id as unknown as { toString: () => string }).toString(),
          name: memberObj.name,
          email: memberObj.email,
          role: memberObj.role,
          image: memberObj.image,
        };
      }),
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    };

    return NextResponse.json(serializedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin can delete projects
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const deletedProject = await Project.findByIdAndDelete(params.id);

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
