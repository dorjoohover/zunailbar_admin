"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = await cookies();

    store.set("token", body.token);
    store.set("merchant_id", body.merchant);
    store.set("branch_id", body.branch);

    // Redirect биш plain JSON буцаана: client (login/components/index.tsx)
    // энэ хариуг үл тоож window.location.href-ээр өөрөө "/" рүү шилждэг.
    // Өмнө нь энд NextResponse.redirect("http://admin.zunailbar.mn/") гэж
    // http-р hardcode хийсэн байсан бөгөөд production https дээр ажилладаг
    // тул fetch() энэ redirect-ийг дагахдаа mixed-content-аар blocked болж
    // throw хийдэг байсан — ингэснээр save()-ийн window.location.href мөр
    // хэзээ ч ажиллахгүй, хэрэглэгч /login дээрээ үлдэж, гараар refresh
    // хийж байж (middleware аль хэдийн бий cookie-г танихад) л "/" рүү
    // орж чаддаг байсан нь заавал-refresh bug-ийн жинхэнэ шалтгаан байв.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("⛔ Route error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
