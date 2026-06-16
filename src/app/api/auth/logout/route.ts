import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearUserSession(response);
  return response;
}
