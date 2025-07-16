import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Notification from "@/models/Notification";
import { connectDB } from "@/lib/db";

// PATCH: Mark notification as read
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const notif = await Notification.findOneAndUpdate(
    { _id: params.id, user: session.user.id },
    { read: true },
    { new: true }
  );
  if (!notif) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }
  return NextResponse.json(notif);
}

// DELETE: Remove notification
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const notif = await Notification.findOneAndDelete({ _id: params.id, user: session.user.id });
  if (!notif) {
    return NextResponse.json({ message: "Notification not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
