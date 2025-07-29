import { NextRequest, NextResponse } from "next/server";
import ContentSection from "@/models/ContentSection";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: { section: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    const content = await ContentSection.findOne({ section: params.section });

    if (!content) {
      return NextResponse.json({ error: "Content section not found" }, { status: 404 });
    }

    // Publish the draft data to published data
    const updatedContent = await ContentSection.findOneAndUpdate(
      { section: params.section },
      {
        $set: {
          publishedData: content.draftData,
          status: "published",
          lastEditedBy: session.user.id,
          lastEditedAt: new Date(),
        },
        $inc: { version: 1 },
      },
      { new: true }
    );

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Error publishing content section:", error);
    return NextResponse.json({ error: "Failed to publish content section" }, { status: 500 });
  }
}
