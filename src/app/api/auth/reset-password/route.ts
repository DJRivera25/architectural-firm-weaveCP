import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  await connectDB();
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken: code.toUpperCase(),
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

  user.password = await bcrypt.hash(password, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return NextResponse.json({ success: true });
}
