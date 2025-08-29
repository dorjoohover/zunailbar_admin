import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  const token = store.get("token")?.value ?? "";
  const merchant = store.get("merchant_id")?.value ?? "";

  // Та upload хийх backend URL-аа энд өгнө
  const uploadUrl = process.env.NEXT_PUBLIC_CORE_API + "/upload";

  return NextResponse.json({
    uploadUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      "merchant-id": merchant,
    },
  });
}