import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  name: string;
  client?: string;
  description?: string;
  status?: "active" | "completed" | "on-hold" | "cancelled";
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  totalTime: number; // Total time spent on project in seconds
  estimatedTime?: number; // Estimated time in seconds
  createdAt?: Date;
  updatedAt?: Date;
  photo?: string;
  members: mongoose.Types.ObjectId[];
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    client: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["active", "completed", "on-hold", "cancelled"], default: "active" },
    budget: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    totalTime: { type: Number, default: 0, min: 0 }, // Total time in seconds
    estimatedTime: { type: Number, min: 0 }, // Estimated time in seconds
    photo: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);
