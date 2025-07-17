import mongoose from "mongoose";

export interface ITaskComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface ITaskAttachment {
  url: string;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends mongoose.Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  description?: string;
  assignees: mongoose.Types.ObjectId[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: Date;
  isActive: boolean;
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<ITaskComment>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const attachmentSchema = new mongoose.Schema<ITaskAttachment>({
  url: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema<ITask>(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    description: { type: String, trim: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    status: { type: String, enum: ["todo", "in-progress", "done", "active", "completed", "paused"], default: "todo" },
    dueDate: { type: Date },
    isActive: { type: Boolean, default: true },
    comments: [commentSchema],
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
