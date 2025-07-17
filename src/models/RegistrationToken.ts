import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRegistrationToken extends Document {
  token: string;
  used: boolean;
  usedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  usedAt?: Date;
  expiresAt: Date;
}

const RegistrationTokenSchema = new Schema<IRegistrationToken>({
  token: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  usedBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date },
  expiresAt: { type: Date, required: true },
});

export default mongoose.models.RegistrationToken ||
  mongoose.model<IRegistrationToken>("RegistrationToken", RegistrationTokenSchema);
