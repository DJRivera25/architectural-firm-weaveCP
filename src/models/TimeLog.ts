import mongoose from "mongoose";

export interface ITimeLog extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  status: "running" | "paused" | "stopped";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeLogSchema = new mongoose.Schema<ITimeLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["running", "paused", "stopped"],
      default: "stopped",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes separately
timeLogSchema.index({ userId: 1, projectId: 1, startTime: -1 });
timeLogSchema.index({ userId: 1, taskId: 1, startTime: -1 });
timeLogSchema.index({ projectId: 1, startTime: -1 });
timeLogSchema.index({ status: 1, userId: 1 });

// Virtual for formatted duration
timeLogSchema.virtual("formattedDuration").get(function (this: ITimeLog) {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  return `${hours
    .toString()
    .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

// Ensure virtuals are included in JSON output
timeLogSchema.set("toJSON", { virtuals: true });
timeLogSchema.set("toObject", { virtuals: true });

// Clear any existing model to prevent conflicts
if (mongoose.models.TimeLog) {
  delete mongoose.models.TimeLog;
}

export default mongoose.model<ITimeLog>("TimeLog", timeLogSchema);
