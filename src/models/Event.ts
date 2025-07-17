import mongoose from "mongoose";

export interface IEvent extends mongoose.Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  type: "meeting" | "deadline" | "holiday" | "event" | "task";
  category: "work" | "personal" | "holiday" | "meeting" | "deadline";
  color: string;
  attendees?: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: [true, "Start date is required"] },
    endDate: { type: Date, required: [true, "End date is required"] },
    allDay: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["meeting", "deadline", "holiday", "event", "task"],
      required: [true, "Event type is required"],
    },
    category: {
      type: String,
      enum: ["work", "personal", "holiday", "meeting", "deadline"],
      required: [true, "Category is required"],
    },
    color: { type: String, default: "#3B82F6" }, // Default blue
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Created by is required"] },
    isPublic: { type: Boolean, default: false },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);
