import { NextRequest, NextResponse } from "next/server";
import { getUserOtp, clearUserOtp, setUserSession, validatePhone } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const phone = body?.phone?.toString().trim();
  const otp = body?.otp?.toString().trim();
  const name = body?.name?.toString().trim();

  if (!validatePhone(phone) || !otp || !name) {
    return NextResponse.json(
      { error: "Name, phone number, and OTP are required." },
      { status: 400 }
    );
  }

  const storedOtp = getUserOtp(request);
  if (!storedOtp || storedOtp.phone !== phone || storedOtp.otp !== otp) {
    return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, phone, name });
  setUserSession(response, phone, name);
  clearUserOtp(response);
  return response;
}
