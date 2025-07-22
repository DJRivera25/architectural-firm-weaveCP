import { NextRequest, NextResponse } from "next/server";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import formidable from "formidable";
import { Fields, Files, File } from "formidable";
import { Readable } from "stream";
import fs from "fs";
import type { IncomingMessage } from "http";
import nodemailer from "nodemailer";

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

// GET - List applications (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");

    const query: { jobId?: string; status?: string } = {};
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;

    const applications = await Application.find(query).populate("jobId", "title").sort({ createdAt: -1 });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// POST - Create new application (public endpoint)
export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      multiples: true,
    });
    // Convert the Web API Request to a Node.js Readable stream
    const buffer = Buffer.from(await request.arrayBuffer());
    const stream = Readable.from(buffer);
    // Convert Headers to plain object for formidable
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    // Monkeypatch: Add headers and method to the stream so formidable thinks it's an IncomingMessage
    (stream as unknown as IncomingMessage).headers = headers;
    (stream as unknown as IncomingMessage).method = request.method || "POST";
    const data = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(stream as IncomingMessage, (err: unknown, fields: Fields, files: Files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });
    const { fields, files } = data;
    // Extract form fields
    const jobId = fields.jobId?.[0];
    const name = fields.name?.[0];
    const email = fields.email?.[0];
    const phone = fields.phone?.[0];
    const coverLetter = fields.coverLetter?.[0] || "";
    // Validate required fields
    if (!jobId || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    console.log("FILES:", files); // Debug: log all files received
    // Extract resume file robustly (array or object)
    const resumeFile = Array.isArray(files.resume) ? files.resume[0] : (files.resume as File | undefined);
    if (!resumeFile || !resumeFile.filepath) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
    }
    // Upload resume to Cloudinary
    const resumeUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "applications/resumes", resource_type: "auto", allowed_formats: ["pdf", "doc", "docx"] },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      Readable.from(fs.createReadStream(resumeFile.filepath)).pipe(uploadStream);
    });
    // Extract cover letter file robustly (array or object)
    let coverLetterUrl = "";
    const coverLetterFile = Array.isArray(files.coverLetterFile)
      ? files.coverLetterFile[0]
      : (files.coverLetterFile as File | undefined);
    if (coverLetterFile && coverLetterFile.filepath) {
      coverLetterUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "applications/coverletters", resource_type: "auto", allowed_formats: ["pdf", "doc", "docx"] },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error("Upload failed"));
            } else {
              resolve(result.secure_url);
            }
          }
        );
        Readable.from(fs.createReadStream(coverLetterFile.filepath)).pipe(uploadStream);
      });
    }
    // Save application
    const application = new Application({
      jobId,
      name,
      email,
      phone: phone || "",
      resume: resumeUrl,
      coverLetter: coverLetterUrl || coverLetter,
      status: "pending",
    });
    await application.save();
    // Fetch job title and slug for email
    let jobTitle = "the position";
    let jobSlug = "";
    try {
      const job = await Job.findById(jobId);
      if (job) {
        jobTitle = job.title;
        jobSlug = job.slug;
      }
    } catch {}
    // Send email to applicant
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const jobUrl = `${process.env.NEXTAUTH_URL}/careers/${jobSlug}`;
      await transporter.sendMail({
        from: `Weave Careers <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Application for ${jobTitle} at Weave`,
        html: `
          <div style="font-family:Arial,sans-serif;font-size:16px;color:#222;background:#f8fafc;padding:32px 0;">
            <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:18px;box-shadow:0 4px 24px #e0e7ef;padding:32px 32px 24px 32px;">
              <div style="display:flex;align-items:center;gap:18px;margin-bottom:28px;">
                <img src='${process.env.NEXTAUTH_URL}/weave-symbol-tri.png' alt='Weave Logo' style='height:48px;width:48px;border-radius:12px;box-shadow:0 2px 8px #e0e7ef;object-fit:contain;background:#fff;' />
                <span style='font-size:2rem;font-weight:800;color:#1e40af;letter-spacing:1px;font-family:Archivo,sans-serif;'>Weave Careers</span>
              </div>
              <h2 style="color:#1e40af;margin-bottom:8px;font-size:1.5rem;font-family:Archivo,sans-serif;">Thank you for applying to Weave!</h2>
              <p style="margin:18px 0 0 0;">Dear <b>${name}</b>,</p>
              <p style="margin:12px 0 0 0;">We have received your application for the <b style='color:#1e40af;'>${jobTitle}</b> position. Our team will review your application and get back to you soon.</p>
              <p style="margin:12px 0 0 0;">You can view the job details here:<br/><a href="${jobUrl}" style="color:#2563eb;text-decoration:underline;">${jobUrl}</a></p>
              <p style="margin:12px 0 0 0;">If your qualifications match our requirements, we will contact you for the next steps.</p>
              <p style="margin:12px 0 0 0;">Thank you for your interest in joining <b style='color:#1e40af;'>Weave</b>. We wish you the best of luck!</p>
              <br/>
              <p style="color:#64748b;font-size:1rem;margin-top:24px;">Best regards,<br/><span style='color:#1e40af;font-weight:600;'>Weave Careers Team</span></p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      // Log but do not fail the request
      console.error("Failed to send applicant email:", e);
    }
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
