import { NextRequest, NextResponse } from "next/server";
import Project from "@/models/Project";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";

// Type definitions for serialization
interface ProjectDocument {
  _id: Types.ObjectId;
  name: string;
  client?: string;
  description?: string;
  status?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  photo?: string;
  members: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

interface SerializedProject {
  _id: string;
  name: string;
  client?: string;
  description?: string;
  status?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  photo?: string;
  members: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Utility function to serialize project data
const serializeProject = (project: ProjectDocument): SerializedProject => ({
  ...project,
  _id: project._id.toString(),
  members: project.members ? project.members.map((member) => member.toString()) : [],
  startDate: project.startDate?.toISOString(),
  endDate: project.endDate?.toISOString(),
  createdAt: project.createdAt?.toISOString(),
  updatedAt: project.updatedAt?.toISOString(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const projects = await Project.find().lean();
  const serializedProjects = projects.map((project) => serializeProject(project as unknown as ProjectDocument));
  return NextResponse.json(serializedProjects);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await request.json();
  const project = await Project.create({
    name: body.name,
    client: body.client,
    description: body.description,
    status: body.status,
    budget: body.budget,
    startDate: body.startDate,
    endDate: body.endDate,
    isActive: body.isActive !== undefined ? body.isActive : true,
    photo: body.photo,
    members: body.members || [],
  });
  const serializedProject = serializeProject(project.toObject() as unknown as ProjectDocument);
  return NextResponse.json(serializedProject, { status: 201 });
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const body = await request.json();
  const project = await Project.findByIdAndUpdate(params.id, body, { new: true });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(project);
}
