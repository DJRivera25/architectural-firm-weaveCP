import mongoose from "mongoose";

export interface ILeave extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  leaveType: "vacation" | "sick" | "personal" | "maternity" | "paternity" | "bereavement" | "other";
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new mongoose.Schema<ILeave>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    leaveType: {
      type: String,
      enum: ["vacation", "sick", "personal", "maternity", "paternity", "bereavement", "other"],
      required: [true, "Leave type is required"],
    },
    startDate: { type: Date, required: [true, "Start date is required"] },
    endDate: { type: Date, required: [true, "End date is required"] },
    totalDays: { type: Number, required: [true, "Total days is required"] },
    reason: { type: String, required: [true, "Reason is required"], trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Calculate total days before saving
leaveSchema.pre("save", function (next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    this.totalDays = diffDays;
  }
  next();
});

export default mongoose.models.Leave || mongoose.model<ILeave>("Leave", leaveSchema);
