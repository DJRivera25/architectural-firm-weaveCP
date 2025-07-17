import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const user = await User.findById(params.id).select(
    "-password -emailConfirmationToken -passwordResetToken -passwordResetExpires"
  );
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const updateData = await request.json();
  // Only allow self or admin to update
  if (session.user.id !== params.id && session.user.role !== "admin" && session.user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const user = await User.findByIdAndUpdate(params.id, updateData, { new: true }).select(
    "-password -emailConfirmationToken -passwordResetToken -passwordResetExpires"
  );
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}
