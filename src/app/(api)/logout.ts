"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const logout = async () => {
  try {
    const store = await cookies();
    store.delete("token");
    store.delete("merchant_id");
    store.delete("branch_id");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/login", baseUrl));
  } catch (error) {
    console.log(error);
  }
};
