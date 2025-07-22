import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  subject: string;
  message: string;
  recipients: Types.ObjectId[];
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  project?: Types.ObjectId;
  team?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    subject: { type: String, required: true },
    message: { type: String, required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
    link: { type: String },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
