// models/User.ts
import { Schema, models, model, ObjectId } from "mongoose";

export interface IGame {
  name: string;
  maxPerson: number;
  minPerson: number;
  startValue: number;
  endValue: number;
  must: boolean;
  _id?: any
}

const GameSchema = new Schema<IGame>(
  {
    name: { type: String, required: true, unique: true },
    maxPerson: { type: Number, required: true },
    minPerson: { type: Number, required: true },
    startValue: { type: Number, required: true },
    endValue: { type: Number, required: true },
    must: { type: Boolean, required: true , default: false},
  },
  {
    timestamps: true,
  }
);

// If the model is already compiled, use it, otherwise compile new
export const Game = models.Game || model<IGame>("Game", GameSchema);
