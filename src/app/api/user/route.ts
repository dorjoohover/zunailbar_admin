// app/api/users/route.ts
import { NextResponse } from "next/server";
import connect from "../../../lib/mongoose";
import { User } from "../../../models/User";

export async function GET() {
  await connect();
  const users = await User.find({}, "name phone").lean();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  await connect();
  const payload = await request.json();
  // simple validation
  //   if (!payload.name || !payload.maxPerson) {
  //     return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  //   }

  const newUser = await User.create({
    name: payload.name,
    password: payload.password,
    phone: payload.phone,
  });
  return NextResponse.json({ insertedId: newUser._id });
}
