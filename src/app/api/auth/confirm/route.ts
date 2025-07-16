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

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    if (user.isEmailConfirmed) {
      return NextResponse.json({ message: "Email is already confirmed." }, { status: 400 });
    }

    // Generate new token
    const crypto = await import("crypto");
    const nodemailer = await import("nodemailer");
    const emailConfirmationToken = crypto.randomBytes(32).toString("hex");
    user.emailConfirmationToken = emailConfirmationToken;
    await user.save();

    // Send confirmation email
    const confirmUrl = `${
      process.env.NEXTAUTH_URL
    }/api/auth/confirm?token=${emailConfirmationToken}&email=${encodeURIComponent(email)}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `Architectural Firm <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Confirm your email - Architectural Firm",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 40px 0;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 1px;">Architectural Firm</div>
              <div style="font-size: 18px; color: #64748b; margin-top: 8px;">Innovative Design Solutions</div>
            </div>
            <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 16px; text-align: center;">Welcome back!</h2>
            <p style="color: #334155; font-size: 16px; margin-bottom: 24px; text-align: center;">
              Please confirm your email address to activate your account and start exploring our portfolio and services.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${confirmUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 2px 8px rgba(37,99,235,0.08); transition: background 0.2s;">Confirm Email</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              If you did not register for an account, you can safely ignore this email.<br />
              <span style="color: #2563eb;">&mdash; The Architectural Firm Team</span>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Confirmation email resent. Please check your inbox." });
  } catch (err) {
    let message = "Failed to resend confirmation email.";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}
