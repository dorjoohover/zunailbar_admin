// app/api/users/route.ts
import { NextResponse } from "next/server";
import connect from "../../../lib/mongoose";
import { Match } from "../../../models/Match";

export async function GET() {
  const users = await Match.find({}, "name phone").lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const payload = await request.json();
  // simple validation
  //   if (!payload.name || !payload.maxPerson) {
  //     return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  //   }

  const newUser = await Match.create({
    team: payload.team,
    game: payload.game,
    parent: payload.parent,
    name: payload.name,
    team_1: payload.team_1,
    team_2: payload.team_2,
  });
  return NextResponse.json({ insertedId: newUser._id });
}
