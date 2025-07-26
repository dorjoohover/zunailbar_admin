// app/api/users/route.ts
import { NextResponse } from "next/server";
import connect from "../../../lib/mongoose";
import { Game } from "../../../models/Game";

export async function GET() {
  await connect();
  const users = await Game.find({}, "name email").lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connect();
  const payload = await request.json();
  // simple validation
  //   if (!payload.name || !payload.maxPerson) {
  //     return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  //   }

  const newUser = await Game.create({
    name: payload.name,
    maxPerson: payload.maxPerson,
    minPerson: payload.minPerson,
    startValue: payload.startValue,
    endValue: payload.endValue,
    must: payload.must,
  });
  return NextResponse.json({ insertedId: newUser._id });
}
