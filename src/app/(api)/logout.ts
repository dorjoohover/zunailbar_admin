"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const logout = async () => {
  try {
    const store = await cookies();
    store.delete("token");
    store.delete("merchant_id");
    store.delete("branch_id");
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "https://admin.srv952218.hstgr.cloud")
    );
  } catch (error) {
    console.log(error);
  }
};
