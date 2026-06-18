import { NextRequest, NextResponse } from "next/server";
import { setUserSession, validatePhone } from "@/lib/auth";
import { loginOrCreateCustomer, validatePin } from "@/lib/customer-auth";

export async function POST(request: NextRequest) {
  console.log("LOGIN API CALLED");

  try {
    const body = await request.json();

    console.log("Request Body:", body);

    const name = body?.name?.toString().trim();
    const phone = body?.phone?.toString().trim();
    const pin = body?.pin?.toString().trim();

    console.log({ name, phone, pin });

    if (!name || !validatePhone(phone) || !validatePin(pin)) {
      return NextResponse.json(
        { error: "Name, phone number, and 4-digit password are required." },
        { status: 400 }
      );
    }

    const customer = await loginOrCreateCustomer({ name, phone, pin });

    console.log("Customer:", customer);

    if (!customer) {
      return NextResponse.json(
        {
          error:
            "Wrong 4-digit password. Please enter the same password used when this phone number was registered.",
        },
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
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_NAME") {
    return NextResponse.json(
      {
        error:
          "This phone number is already registered with a different name. Please enter the original name used during registration.",
      },
      { status: 401 }
    );
  }
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}