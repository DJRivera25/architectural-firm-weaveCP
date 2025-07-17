import mongoose, { Schema, Types } from "mongoose";

export interface ITeam extends mongoose.Document {
  name: string;
  description?: string;
  members: Types.ObjectId[];
  manager?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    manager: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model<ITeam>("Team", teamSchema);
