import mongoose from "mongoose";

export interface IContentSection extends mongoose.Document {
  section: string; // 'hero', 'about', 'why-weave', 'process', 'portfolio', 'team', 'contact', 'footer'
  draftData: Record<string, unknown>;
  publishedData: Record<string, unknown>;
  status: "draft" | "published" | "unpublished";
  version: number;
  lastEditedBy: mongoose.Types.ObjectId;
  lastEditedAt: Date;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const contentSectionSchema = new mongoose.Schema<IContentSection>(
  {
    section: {
      type: String,
      required: true,
      trim: true,
      enum: ["hero", "about", "why-weave", "process", "portfolio", "team", "contact", "footer"],
    },
    draftData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    publishedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "unpublished",
    },
    version: {
      type: Number,
      default: 1,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastEditedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
contentSectionSchema.index({ section: 1, isActive: 1 });
contentSectionSchema.index({ status: 1 });
contentSectionSchema.index({ lastEditedAt: -1 });

export default mongoose.models.ContentSection ||
  mongoose.model<IContentSection>("ContentSection", contentSectionSchema);
