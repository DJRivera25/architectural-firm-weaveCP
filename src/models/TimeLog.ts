import mongoose from "mongoose";

export interface ITimeLog extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  timeIn: Date;
  timeOut?: Date;
  totalHours?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timeLogSchema = new mongoose.Schema<ITimeLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    timeIn: {
      type: Date,
      required: [true, "Time in is required"],
    },
    timeOut: {
      type: Date,
    },
    totalHours: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total hours when timeOut is set
timeLogSchema.pre("save", function (next) {
  if (this.timeOut && this.timeIn) {
    const diffInMs = this.timeOut.getTime() - this.timeIn.getTime();
    this.totalHours = Math.round((diffInMs / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

export default mongoose.models.TimeLog || mongoose.model<ITimeLog>("TimeLog", timeLogSchema);
