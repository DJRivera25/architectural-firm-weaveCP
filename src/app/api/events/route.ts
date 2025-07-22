import { NextRequest, NextResponse } from "next/server";
import Event from "@/models/Event";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const url = request.nextUrl;
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");
  const employeeOnly = url.searchParams.get("employeeOnly") === "true";

  const filter: Record<string, unknown> = {};

  // Date range filter
  if (startDate && endDate) {
    filter.startDate = { $lte: new Date(endDate) };
    filter.endDate = { $gte: new Date(startDate) };
  }

  // Type and category filters
  if (type) filter.type = type;
  if (category) filter.category = category;

  let events;
  if (employeeOnly) {
    // Only events where the user is an attendee or events with no attendees
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);
    events = await Event.find({
      $or: [{ attendees: userObjectId }, { attendees: { $exists: true, $size: 0 } }, { attendees: { $exists: false } }],
      ...filter,
    })
      .populate("createdBy", "name")
      .populate("attendees", "name");
  } else {
    // Show public events and user's own events
    events = await Event.find({
      $or: [{ isPublic: true }, { createdBy: session.user.id }, { attendees: session.user.id }],
      ...filter,
    })
      .populate("createdBy", "name")
      .populate("attendees", "name");
  }

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  // Validate required fields
  if (!body.title || !body.startDate || !body.endDate || !body.type || !body.category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate dates
  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (endDate < startDate) {
    return NextResponse.json({ error: "End date cannot be before start date" }, { status: 400 });
  }

  const event = await Event.create({
    ...body,
    createdBy: session.user.id,
  });

  const populatedEvent = await event.populate("createdBy", "name");

  return NextResponse.json(populatedEvent, { status: 201 });
}
