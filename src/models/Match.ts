// models/User.ts
import mongoose, { Schema, models, model, ObjectId } from "mongoose";
import { IGame } from "./Game";

export interface IMatch {
  name: string;
  _id?: any;
  team: mongoose.Types.ObjectId;
  game: mongoose.Types.ObjectId | IGame;
  team_1: mongoose.Types.ObjectId[];
  team_2: mongoose.Types.ObjectId[];
  parent: mongoose.Types.ObjectId | null;
}

const MatchSchema = new Schema<IMatch>(
  {
    team: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "Team", // self-reference
      default: null, // if you want to allow null
      required: false, // not required
    },
    team_1: {
      type: [Schema.Types.ObjectId], // the “foreign key” type
      ref: "User", // self-reference
      default: null, // if you want to allow null
      required: false, // not required
    },
    team_2: {
      type: [Schema.Types.ObjectId], // the “foreign key” type
      ref: "User", // self-reference
      default: null, // if you want to allow null
      required: false, // not required
    },
    game: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "game", // self-reference
      required: true, // not required
    },
    parent: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "Match", // self-reference
      default: null, // if you want to allow null
      required: false, // not required
    },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Match = models.Match || model<IMatch>("Match", MatchSchema);
