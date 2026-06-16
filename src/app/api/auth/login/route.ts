import { NextRequest, NextResponse } from "next/server";
import { setUserSession, validatePhone } from "@/lib/auth";
import { loginOrCreateCustomer, validatePin } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body?.name?.toString().trim();
  const phone = body?.phone?.toString().trim();
  const pin = body?.pin?.toString().trim();

  if (!name || !validatePhone(phone) || !validatePin(pin)) {
    return NextResponse.json(
      { error: "Name, phone number, and 4-digit password are required." },
      { status: 400 }
    );
  }

  const customer = await loginOrCreateCustomer({ name, phone, pin });
  if (!customer) {
    return NextResponse.json(
      { error: "Incorrect 4-digit password for this phone number." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    phone: customer.phone,
    name: customer.name,
  });
  setUserSession(response, customer.phone, customer.name);
  return response;
}
