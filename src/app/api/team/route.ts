import { NextRequest, NextResponse } from "next/server";
import Team from "@/models/Team";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Types } from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const teams = await Team.find().populate("members").populate("manager");
  return NextResponse.json(teams);
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
    const populatedTeam = await Team.findById(team._id).populate("members").populate("manager");
    return NextResponse.json(populatedTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}
