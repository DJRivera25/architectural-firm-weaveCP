import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  await connectDB();
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Generate a random 6-character code (alphanumeric, uppercase)
  const code = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 6);
  console.log("[Password Reset] Generated code for", email, ":", code);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        passwordResetToken: code,
        passwordResetExpires: Date.now() + 60 * 1000,
      },
    },
    { new: true }
  );
  if (!user) return NextResponse.json({ success: true }); // Don't reveal user existence

  // Send beautiful email with logo and company name
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    to: email,
    from: `Weave Collaboration Partners <${process.env.SMTP_USER}>`,
    subject: "Password Reset Verification Code - Weave Collaboration Partners",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f8fb; padding: 40px 0;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src='${process.env.NEXTAUTH_URL}/weave-symbol-tri.png' alt='Weave Logo' style='height: 64px; margin-bottom: 12px;' />
            <div style="font-size: 28px; font-weight: bold; color: #2563eb; letter-spacing: 1px;">Weave Collaboration Partners</div>
          </div>
          <h2 style="color: #1e293b; font-size: 22px; margin-bottom: 16px; text-align: center;">Password Reset Request</h2>
          <p style="color: #334155; font-size: 16px; margin-bottom: 24px; text-align: center;">
            Use the following verification code to reset your password. This code is valid for <b>1 minute</b>.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="display: inline-block; background: #2563eb; color: #fff; font-weight: 700; padding: 18px 40px; border-radius: 10px; font-size: 32px; letter-spacing: 6px; box-shadow: 0 2px 8px rgba(37,99,235,0.08);">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you did not request a password reset, you can safely ignore this email.<br />
            <span style="color: #2563eb;">&mdash; Weave Collaboration Partners Team</span>
          </p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: user });
}
