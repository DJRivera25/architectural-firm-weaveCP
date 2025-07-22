import mongoose from "mongoose";

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  portfolioLink?: string;
  status: "pending" | "reviewed" | "accepted" | "rejected";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    resume: {
      type: String,
      required: [true, "Resume is required"],
    },
    coverLetter: {
      type: String,
      required: [true, "Cover letter is required"],
    },
    portfolioLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
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

export default mongoose.models.Application || mongoose.model<IApplication>("Application", applicationSchema);
