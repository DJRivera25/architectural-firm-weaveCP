import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

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

  return NextResponse.json({ teams });
}
