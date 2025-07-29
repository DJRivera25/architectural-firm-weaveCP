import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

interface UserDocument {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin and manager can fetch all users
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const users = await User.find({ isActive: true }).select("_id name email role").sort({ name: 1 }).lean();

    const serializedUsers = users.map((user) => ({
      id: (user as unknown as UserDocument)._id.toString(),
      name: (user as unknown as UserDocument).name,
      email: (user as unknown as UserDocument).email,
      role: (user as unknown as UserDocument).role,
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
