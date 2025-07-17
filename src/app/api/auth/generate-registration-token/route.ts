import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import RegistrationToken from "@/models/RegistrationToken";
import crypto from "crypto";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectDB();
  const token = crypto.randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const tokenDoc = await RegistrationToken.create({
    token,
    createdBy: session.user.id,
    expiresAt,
  });
  return NextResponse.json({ token: tokenDoc.token });
}
