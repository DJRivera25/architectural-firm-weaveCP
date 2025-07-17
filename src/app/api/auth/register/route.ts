import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import RegistrationToken from "@/models/RegistrationToken";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, registrationToken } = await req.json();
    if (!name || !email || !password || !registrationToken) {
      return NextResponse.json({ message: "All fields and a valid registration token are required." }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email already registered." }, { status: 400 });
    }

    // Validate registration token
    const tokenDoc = await RegistrationToken.findOne({ token: registrationToken, used: false });
    if (!tokenDoc) {
      return NextResponse.json({ message: "Invalid or already used registration token." }, { status: 400 });
    }
    if (tokenDoc.expiresAt < new Date()) {
      return NextResponse.json({ message: "Registration token has expired." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailConfirmationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailConfirmed: false,
      emailConfirmationToken,
      registrationToken,
    });

    // Mark token as used
    tokenDoc.used = true;
    tokenDoc.usedBy = user._id;
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

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
      from: `Weave Collaboration Partners <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Confirm your email - Weave Collaboration Partners",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 40px 0;">
          <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src='${process.env.NEXTAUTH_URL}/weave-symbol-tri.png' alt='Weave Logo' style='height: 64px; margin-bottom: 12px;' />
              <div style="font-size: 28px; font-weight: bold; color: #2563eb; letter-spacing: 1px;">Weave Collaboration Partners</div>
            </div>
            <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 16px; text-align: center;">Welcome, ${name}!</h2>
            <p style="color: #334155; font-size: 16px; margin-bottom: 24px; text-align: center;">
              Thank you for registering with <b>Weave Collaboration Partners</b>.<br />
              Please confirm your email address to activate your account and start exploring our portfolio and services.
            </p>
            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${confirmUrl}" style="display: inline-block; background: #2563eb; color: #fff; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; box-shadow: 0 2px 8px rgba(37,99,235,0.08); transition: background 0.2s;">Confirm Email</a>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              If you did not register for an account, you can safely ignore this email.<br />
              <span style="color: #2563eb;">&mdash; Weave Collaboration Partners Team</span>
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "Registration successful. Please check your email to confirm your account." });
  } catch (err: unknown) {
    let message = "Registration failed.";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ message }, { status: 500 });
  }
}
