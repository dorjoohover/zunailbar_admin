// app/api/users/route.ts
import { NextResponse } from "next/server";
import connect from "../../../lib/mongoose";
import { Team } from "../../../models/Team";

export async function GET() {
  await connect();
  const teams = await Team.find().lean();
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  await connect();
  const payload = await request.json();
  // simple validation
  //   if (!payload.name || !payload.maxPerson) {
  //     return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  //   }

  console.log({
    users: payload.users,
    name: payload.name,
    type: payload.type,
    parent: payload.parent,
  });

  const newTeam = await Team.create({
    users: payload.users,
    name: payload.name,
    type: payload.type,
    parent: payload.parent ?? null,
  }).catch((e) => console.log(e));
  return NextResponse.json({ insertedId: newTeam._id });
}
