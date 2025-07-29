import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";

// Type definitions for serialization
interface TeamDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  members: (Types.ObjectId | { _id: Types.ObjectId; [key: string]: unknown })[];
  manager?: Types.ObjectId | { _id: Types.ObjectId; [key: string]: unknown };
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

interface SerializedTeam {
  _id: string;
  name: string;
  description?: string;
  members: (string | { _id: string; [key: string]: unknown })[];
  manager?: string | { _id: string; [key: string]: unknown };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Utility function to serialize team data
const serializeTeam = (team: TeamDocument): SerializedTeam => ({
  ...team,
  _id: team._id.toString(),
  members: team.members.map((member) =>
    typeof member === "object" && member._id ? { ...member, _id: member._id.toString() } : member.toString()
  ),
  manager: team.manager
    ? typeof team.manager === "object" && team.manager._id
      ? { ...team.manager, _id: team.manager._id.toString() }
      : team.manager.toString()
    : undefined,
  createdAt: team.createdAt?.toISOString(),
  updatedAt: team.updatedAt?.toISOString(),
});

export async function GET(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const team = await Team.findById(params.id).populate("members").populate("manager").lean();
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  const serializedTeam = serializeTeam(team as unknown as TeamDocument);
  return NextResponse.json(serializedTeam);
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const { name, description, members, manager } = await request.json();
  const update: Record<string, unknown> = {};
  if (name) update.name = name;
  if (description !== undefined) update.description = description;
  if (Array.isArray(members)) update.members = members.map((id: string) => new Types.ObjectId(id));
  if (manager) update.manager = new Types.ObjectId(manager);
  const team = await Team.findByIdAndUpdate(params.id, update, { new: true })
    .populate("members")
    .populate("manager")
    .lean();
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  const serializedTeam = serializeTeam(team as unknown as TeamDocument);
  return NextResponse.json(serializedTeam);
}

export async function DELETE(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const team = await Team.findByIdAndDelete(params.id);
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
