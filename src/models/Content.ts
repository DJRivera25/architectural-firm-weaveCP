import mongoose from "mongoose";

export interface IContent extends mongoose.Document {
  section: string;
  title: string;
  content: string;
  images: string[];
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
      enum: ["home", "about", "process", "why-choose-us", "team", "portfolio", "careers"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    images: [
      {
        type: String,
      },
    ],
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
