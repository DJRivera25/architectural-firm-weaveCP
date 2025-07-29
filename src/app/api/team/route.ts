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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const teams = await Team.find().populate("members").populate("manager").lean();

  // Serialize all teams
  const serializedTeams = teams.map((team) => serializeTeam(team as unknown as TeamDocument));
  return NextResponse.json(serializedTeams);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await connectDB();
    const { name, description, members, manager } = await request.json();
    if (!name || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: "Name and members are required" }, { status: 400 });
    }
    const team = await Team.create({
      name,
      description,
      members: members.map((id: string) => new Types.ObjectId(id)),
      manager: manager ? new Types.ObjectId(manager) : undefined,
    });
    const populatedTeam = await Team.findById(team._id).populate("members").populate("manager").lean();
    const serializedTeam = serializeTeam(populatedTeam as unknown as TeamDocument);
    return NextResponse.json(serializedTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
