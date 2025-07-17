import mongoose from "mongoose";

export interface IContent extends mongoose.Document {
  section: string;
  draftData: Record<string, unknown>;
  publishedData: Record<string, unknown>;
  status: "draft" | "published";
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new mongoose.Schema<IContent>(
  {
    section: {
      type: String,
      required: [true, "Section is required"],
      enum: ["hero", "about", "why-weave", "process", "portfolio", "team", "contact", "footer"],
    },
    draftData: {
      type: Object,
      required: true,
      default: {},
    },
    publishedData: {
      type: Object,
      required: true,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Content || mongoose.model<IContent>("Content", contentSchema);
