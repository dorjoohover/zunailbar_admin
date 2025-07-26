// models/User.ts
import mongoose, { Schema, models, model } from "mongoose";

export interface IScore {
  name: string;
  _id?: any;
  match: mongoose.Types.ObjectId | null;
  team: mongoose.Types.ObjectId | null;
  win: number;
  lose: number;
}

const ScoreSchema = new Schema<IScore>(
  {
    name: { type: String, required: true, unique: true },
    win: { type: Number, required: true, default: 0 },
    lose: { type: Number, required: true, default: 0 },
    match: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "Match", // self-reference
      required: true, // not required
    },
    team: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "Team", // self-reference
      required: true, // not required
    },
  },
  {
    timestamps: true,
  }
);

// If the model is already compiled, use it, otherwise compile new
export const Score = models.Score || model<IScore>("Score", ScoreSchema);
