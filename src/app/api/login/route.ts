'use server'
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = await cookies();

    store.set("token", body.token);
    store.set("merchant_id", body.merchant_id);
    store.set("branch_id", body.branch_id);

    console.log("✅ Cookie set:", body);

    return NextResponse.redirect(
      new URL(
        "/",
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      )
    );
  } catch (error) {
    console.error("⛔ Route error:", error);
    return NextResponse.json({ success: false });
  }
}
