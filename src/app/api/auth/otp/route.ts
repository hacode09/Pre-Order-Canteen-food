import { NextRequest, NextResponse } from "next/server";
import { setUserOtp, validatePhone } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const phone = body?.phone?.toString().trim();

  if (!validatePhone(phone)) {
    return NextResponse.json(
      { error: "Please enter a valid 10-digit phone number." },
      { status: 400 }
    );
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const response = NextResponse.json({
    success: true,
    message: `OTP sent to ${phone}. Use code ${otp} to continue.`,
    otp,
  });

  setUserOtp(response, phone, otp);
  return response;
}
