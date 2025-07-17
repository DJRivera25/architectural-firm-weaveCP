import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "owner" | "admin" | "employee" | "manager";
  team?: "production" | "management" | "admin";
  position?: string;
  image?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  isEmailConfirmed: boolean;
  emailConfirmationToken: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  registrationToken?: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "employee", "manager"],
      default: "employee",
    },
    team: {
      type: String,
      enum: ["production", "management", "admin"],
      required: false,
    },
    position: {
      type: String,
      trim: true,
      required: false,
    },
    image: {
      type: String,
    },
    isEmailConfirmed: {
      type: Boolean,
      default: false,
    },
    emailConfirmationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
      required: false,
    },
    passwordResetExpires: {
      type: Date,
      required: false,
    },
    registrationToken: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema);
