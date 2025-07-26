// models/User.ts
import { Schema, models, model } from "mongoose";

export interface IUser {
  name?: string;
  phone?: string;
  password?: string;
  _id: any
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// If the model is already compiled, use it, otherwise compile new
export const User = models.User || model<IUser>("User", UserSchema);
