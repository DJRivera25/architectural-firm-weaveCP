import mongoose from "mongoose";

export interface ITimeLog extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  overtimeReason?: string;
  billable?: boolean;
  hourlyRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timeLogSchema = new mongoose.Schema<ITimeLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    date: { type: Date, required: [true, "Date is required"], default: Date.now },
    timeIn: { type: Date, required: [true, "Time in is required"] },
    timeOut: { type: Date },
    totalHours: { type: Number },
    regularHours: { type: Number },
    overtimeHours: { type: Number },
    overtimeReason: { type: String, trim: true },
    billable: { type: Boolean, default: false },
    hourlyRate: { type: Number },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

timeLogSchema.pre("save", function (next) {
  if (this.timeOut && this.timeIn) {
    const diffInMs = this.timeOut.getTime() - this.timeIn.getTime();
    this.totalHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100;

    // Calculate overtime (PH time: 8 hours regular work day, overtime after 5:00 PM)
    const timeIn = new Date(this.timeIn);
    const timeOut = new Date(this.timeOut);

    // Set regular work hours (8 hours from 9 AM to 5 PM)
    const regularStart = new Date(timeIn);
    regularStart.setHours(9, 0, 0, 0);

    const regularEnd = new Date(timeIn);
    regularEnd.setHours(17, 0, 0, 0); // 5:00 PM

    // Calculate regular hours (capped at 8 hours)
    const regularHoursMs = Math.min(
      Math.max(0, regularEnd.getTime() - Math.max(regularStart.getTime(), timeIn.getTime())),
      8 * 60 * 60 * 1000 // 8 hours in milliseconds
    );

    this.regularHours = Math.round((regularHoursMs / (1000 * 60 * 60)) * 100) / 100;
    this.overtimeHours = Math.max(0, this.totalHours - this.regularHours);

    // Auto-flag overtime if clock out is after 5:00 PM
    if (timeOut.getHours() >= 17 && this.overtimeHours > 0 && !this.overtimeReason) {
      this.overtimeReason = "Auto-flagged: Clock out after 5:00 PM";
    }
  }
  next();
});

export default mongoose.models.TimeLog || mongoose.model<ITimeLog>("TimeLog", timeLogSchema);
