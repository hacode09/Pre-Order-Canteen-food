import { NextRequest, NextResponse } from "next/server";
import {
  getAdminPassword,
  setAdminSession,
  unauthorizedResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || password !== getAdminPassword()) {
    return unauthorizedResponse();
  }

  const response = NextResponse.json({ success: true });
  return setAdminSession(response);
}
