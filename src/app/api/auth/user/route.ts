import { NextResponse, NextRequest } from "next/server";
import { getUserSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = getUserSession(request);
  return NextResponse.json({
    authenticated: Boolean(session?.phone),
    phone: session?.phone ?? null,
    name: session?.name ?? null,
  });
}
