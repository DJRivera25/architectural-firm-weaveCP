import { NextRequest, NextResponse } from "next/server";
import Task from "@/models/Task";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import formidable, { Fields, Files, File } from "formidable";
import { Readable } from "stream";
import fs from "fs";
import type { IncomingMessage } from "http";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

function isAssigneeId(obj: unknown): obj is { toString: () => string } {
  return typeof obj === "object" && obj !== null && typeof (obj as { toString: unknown }).toString === "function";
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const task = await Task.findById(params.id).select("attachments assignees");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (
    session.user.role === "employee" &&
    !task.assignees.some((a: unknown) => isAssigneeId(a) && a.toString() === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(task.attachments);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const task = await Task.findById(params.id).select("assignees attachments");
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  if (
    session.user.role === "employee" &&
    !task.assignees.some((a: unknown) => isAssigneeId(a) && a.toString() === session.user.id)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const form = new formidable.IncomingForm();
  const data = await new Promise<{ file?: File }>((resolve, reject) => {
    form.parse(request as unknown as IncomingMessage, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      else resolve(files as { file?: File });
    });
  });
  const file = data.file;
  if (!file || !file.filepath) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  const uploadStream = cloudinary.uploader.upload_stream({ folder: "tasks/attachments" }, async (error, result) => {
    if (error || !result) {
      return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
    }
    const attachment = {
      url: result.secure_url,
      uploadedBy: session.user.id,
      uploadedAt: new Date(),
    };
    task.attachments.push(attachment);
    await task.save();
    return NextResponse.json(attachment, { status: 201 });
  });
  Readable.from(fs.createReadStream(file.filepath)).pipe(uploadStream);
}
