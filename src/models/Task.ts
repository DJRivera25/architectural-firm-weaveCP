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

export interface ITaskChecklistItem {
  text: string;
  checked: boolean;
  createdAt: Date;
  checkedAt?: Date;
}

export interface ITaskActivity {
  type: string; // e.g., 'created', 'status_changed', 'assigned', 'comment', etc.
  user: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

export interface ITask extends mongoose.Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  description?: string;
  assignees: mongoose.Types.ObjectId[];
  status: "todo" | "in-progress" | "done" | "active" | "completed" | "paused";
  dueDate?: Date;
  isActive: boolean;
  totalTime: number; // Total time spent on task in seconds
  estimatedTime?: number; // Estimated time in seconds
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
  checklist: ITaskChecklistItem[];
  activity: ITaskActivity[];
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

const checklistItemSchema = new mongoose.Schema<ITaskChecklistItem>({
  text: { type: String, required: true, trim: true },
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  checkedAt: { type: Date },
});

const activitySchema = new mongoose.Schema<ITaskActivity>({
  type: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema<ITask>(
  {
    name: { type: String, required: true, trim: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    description: { type: String, trim: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["todo", "in-progress", "done", "active", "completed", "paused"], default: "todo" },
    dueDate: { type: Date },
    isActive: { type: Boolean, default: true },
    totalTime: { type: Number, default: 0, min: 0 }, // Total time in seconds
    estimatedTime: { type: Number, min: 0 }, // Estimated time in seconds
    comments: [commentSchema],
    attachments: [attachmentSchema],
    checklist: [checklistItemSchema],
    activity: [activitySchema],
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
