import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  try {
    const project = await Project.findById(params.id).populate("members", "name email role image isActive");

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Return only active members
    const activeMembers = project.members.filter((member: unknown) => {
      const memberObj = member as { isActive?: boolean };
      return memberObj.isActive !== false;
    });

    const serializedMembers = activeMembers.map((member: unknown) => {
      const memberObj = member as {
        _id: unknown;
        name: string;
        email: string;
        role: string;
        image?: string;
        isActive?: boolean;
      };
      return {
        _id: (memberObj._id as unknown as { toString: () => string }).toString(),
        name: memberObj.name,
        email: memberObj.email,
        role: memberObj.role,
        image: memberObj.image,
        isActive: memberObj.isActive,
      };
    });

    return NextResponse.json(serializedMembers);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json({ error: "Failed to fetch project members" }, { status: 500 });
  }
}
