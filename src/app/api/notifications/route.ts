import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Notification from "@/models/Notification";
import User from "@/models/User";
import Team from "@/models/Team";
import { Types } from "mongoose";
import Project from "@/models/Project";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/db";

// GET: Fetch all notifications for the authenticated user
export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  // Find notifications where the user is a recipient
  const notifications = await Notification.find({ recipients: session.user.id })
    .populate("recipients", "name email image")
    .populate("project", "name")
    .populate("team", "name")
    .sort({ createdAt: -1 });
  return NextResponse.json(notifications);
}

// POST: Create a new notification (admin or system use)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { subject, message, type = "info", recipients = [], project, team, link } = await req.json();
    if (!subject || !message || (!recipients.length && !project && !team)) {
      return NextResponse.json(
        { message: "Subject, message, and at least one recipient, project, or team are required." },
        { status: 400 }
      );
    }

    // Resolve all user IDs
    let userIds: string[] = Array.isArray(recipients) ? recipients : [];
    // Add users from project
    if (project) {
      const proj = await Project.findById(project);
      if (proj && proj.team) {
        const teamDoc = await Team.findById(proj.team);
        if (teamDoc) {
          userIds = userIds.concat(teamDoc.members.map((id: Types.ObjectId) => id.toString()));
        }
      }
    }
    // Add users from team
    if (team) {
      const teamDoc = await Team.findById(team);
      if (teamDoc) {
        userIds = userIds.concat(teamDoc.members.map((id: Types.ObjectId) => id.toString()));
      }
    }
    // Remove duplicates
    userIds = Array.from(new Set(userIds));
    if (userIds.length === 0) {
      return NextResponse.json({ message: "No valid recipients found." }, { status: 400 });
    }

    // Fetch user emails
    const users = await User.find({ _id: { $in: userIds } });

    // Create notifications and send emails
    const notifications = [];
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    for (const user of users) {
      const notif = await Notification.create({
        subject,
        message,
        recipients: [user._id],
        type,
        read: false,
        link,
        project: project || undefined,
        team: team || undefined,
      });
      notifications.push(notif);
      // Send email
      await transporter.sendMail({
        from: `Weave Notifications <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `[Weave Notification] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;font-size:16px;color:#222;background:#f8fafc;padding:32px 0;">
            <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 4px 24px #e0e7ef;padding:32px 32px 24px 32px;">
              <div style="display:flex;align-items:center;gap:18px;margin-bottom:28px;">
                <img src='${
                  process.env.NEXTAUTH_URL
                }/weave-symbol-tri.png' alt='Weave Logo' style='height:48px;width:48px;border-radius:12px;box-shadow:0 2px 8px #e0e7ef;object-fit:contain;background:#fff;' />
                <span style='font-size:2rem;font-weight:800;color:#1e40af;letter-spacing:1px;font-family:Archivo,sans-serif;'>Weave Notification</span>
              </div>
              <h2 style="color:#1e40af;margin-bottom:8px;font-size:1.5rem;font-family:Archivo,sans-serif;">${subject}</h2>
              <p style="margin:18px 0 0 0;">Dear <b>${user.name}</b>,</p>
              <p style="margin:12px 0 0 0;">${message.replace(/\n/g, "<br/>")}</p>
              ${
                link
                  ? `<p style="margin:12px 0 0 0;">View more: <a href="${link}" style="color:#2563eb;text-decoration:underline;">${link}</a></p>`
                  : ""
              }
              <br/>
              <p style="color:#64748b;font-size:1rem;margin-top:24px;">Best regards,<br/><span style='color:#1e40af;font-weight:600;'>Weave Team</span></p>
            </div>
          </div>
        `,
      });
    }
    return NextResponse.json({ success: true, count: notifications.length }, { status: 201 });
  } catch (err) {
    console.error("Notification POST error:", err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
