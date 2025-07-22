import mongoose from "mongoose";

export interface IJob extends mongoose.Document {
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to generate slug from title if not provided
jobSchema.pre<IJob>("validate", async function (next) {
  if (!this.slug && this.title) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let count = 1;
    // Ensure uniqueness
    while (await mongoose.models.Job.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

export default mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);
