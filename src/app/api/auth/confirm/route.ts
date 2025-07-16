import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      return NextResponse.json({ message: "Invalid confirmation link." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email, emailConfirmationToken: token });
    if (!user) {
      return NextResponse.json({ message: "Invalid or expired confirmation link." }, { status: 400 });
    }

    user.isEmailConfirmed = true;
    user.emailConfirmationToken = undefined;
    await user.save();

    // Optionally, redirect to a confirmation page
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?confirmed=1`);
  } catch (err) {
    return NextResponse.json({ message: "Email confirmation failed." }, { status: 500 });
  }
}
