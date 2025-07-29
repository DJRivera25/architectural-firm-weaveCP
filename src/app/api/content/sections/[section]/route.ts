import { NextRequest, NextResponse } from "next/server";
import ContentSection from "@/models/ContentSection";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { section: string } }) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await ContentSection.findOne({
      section: params.section,
      isActive: true,
    });

    if (!content) {
      return NextResponse.json({
        section: params.section,
        draftData: {},
        publishedData: {},
        status: "unpublished",
        version: 1,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
        isActive: true,
        order: 0,
      });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching content section:", error);
    return NextResponse.json({ error: "Failed to fetch content section" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { section: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const body = await request.json();

  try {
    const updateData: Record<string, unknown> = {
      lastEditedBy: session.user.id,
      lastEditedAt: new Date(),
    };

    if (body.draftData) {
      updateData.draftData = body.draftData;
      updateData.status = "draft";
    }

    if (body.publishedData) {
      updateData.publishedData = body.publishedData;
      updateData.status = "published";
    }

    if (body.status) {
      updateData.status = body.status;
    }

    const content = await ContentSection.findOneAndUpdate(
      { section: params.section },
      {
        $set: updateData,
        $inc: { version: 1 },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(content);
  } catch (error) {
    console.error("Error updating content section:", error);
    return NextResponse.json({ error: "Failed to update content section" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { section: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  try {
    await ContentSection.findOneAndUpdate({ section: params.section }, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content section:", error);
    return NextResponse.json({ error: "Failed to delete content section" }, { status: 500 });
  }
}
