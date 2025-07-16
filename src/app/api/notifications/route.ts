import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Notification from "@/models/Notification";
import { connectDB } from "@/lib/db";

// GET: Fetch all notifications for the authenticated user
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const notifications = await Notification.find({ user: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(notifications);
}

// POST: Create a new notification (admin or system use)
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { user, message, type = "info", link } = await req.json();
  if (!user || !message) {
    return NextResponse.json({ message: "User and message are required." }, { status: 400 });
  }
  const notification = await Notification.create({
    user,
    message,
    type,
    link,
  });
  return NextResponse.json(notification, { status: 201 });
}
