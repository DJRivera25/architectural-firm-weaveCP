import mongoose from "mongoose";

export interface ILeaveCredit extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  year: number;
  leaveType: "vacation" | "sick" | "personal" | "maternity" | "paternity" | "bereavement";
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaveCreditSchema = new mongoose.Schema<ILeaveCredit>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "User ID is required"] },
    year: { type: Number, required: [true, "Year is required"] },
    leaveType: {
      type: String,
      enum: ["vacation", "sick", "personal", "maternity", "paternity", "bereavement"],
      required: [true, "Leave type is required"],
    },
    totalCredits: { type: Number, required: [true, "Total credits is required"], default: 0 },
    usedCredits: { type: Number, required: [true, "Used credits is required"], default: 0 },
    remainingCredits: { type: Number, required: [true, "Remaining credits is required"], default: 0 },
  },
  { timestamps: true }
);

// Calculate remaining credits before saving
leaveCreditSchema.pre("save", function (next) {
  this.remainingCredits = this.totalCredits - this.usedCredits;
  next();
});

// Compound index to ensure unique user-year-leaveType combination
leaveCreditSchema.index({ userId: 1, year: 1, leaveType: 1 }, { unique: true });

export default mongoose.models.LeaveCredit || mongoose.model<ILeaveCredit>("LeaveCredit", leaveCreditSchema);
