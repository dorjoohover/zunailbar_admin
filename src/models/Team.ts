// models/Team.ts
import { TeamType } from "@/lib/enum";
import mongoose, { Schema, model, models } from "mongoose";

export interface ITeam {
  users: mongoose.Types.ObjectId[]; // хэрэглэгчдийн ID-үүд
  name: string;
  type: TeamType; // true бол баг, false бол “өдрийн бүлэг”
  parent: mongoose.Types.ObjectId | null;
}

const TeamSchema = new Schema<ITeam>(
  {
    users: {
      type: [Schema.Types.ObjectId], // массиваар ObjectId-үүд
      ref: "User", // хэрвээ User коллекцийн холболттой бол
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: Number,
      required: true,
      // default: TeamType.TEAM,
    },
    parent: {
      type: Schema.Types.ObjectId, // the “foreign key” type
      ref: "Team", // self-reference
      default: null, // if you want to allow null
      required: false, // not required
    },
  },
  {
    timestamps: true,
  }
);

// Хэрвээ өмнө нь компайлдсан бол тэр моделиэ, эс бөгөөс шинээр
export const Team = models.Team || model<ITeam>("Team", TeamSchema);
