import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";
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
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Find all teams where the user is a member or manager
  const teams = await Team.find({
    $or: [{ manager: userId }, { members: userId }],
  })
    .populate({
      path: "members",
      select: "_id name email image role position",
      model: User,
    })
    .populate({
      path: "manager",
      select: "_id name email image role position",
      model: User,
    })
    .lean();

  // Serialize all teams
  const serializedTeams = teams.map((team) => serializeTeam(team as unknown as TeamDocument));
  return NextResponse.json({ teams: serializedTeams });
}
