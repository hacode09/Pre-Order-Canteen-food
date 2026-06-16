import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/auth";
import { getRevenueStats } from "@/lib/store";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const stats = getRevenueStats();
  return NextResponse.json(stats);
}
