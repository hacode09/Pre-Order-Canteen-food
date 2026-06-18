import { NextRequest, NextResponse } from "next/server";
import {
  getUserSession,
  isAdminRequest,
  unauthorizedResponse,
} from "@/lib/auth";
import { createOrder, getOrders } from "@/lib/store";

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const session = getUserSession(request);

  if (!session?.phone && !isAdminRequest(request)) {
    return unauthorizedResponse();
  }

  if (session?.phone && phone && phone !== session.phone) {
    return unauthorizedResponse();
  }

  let orders = await getOrders();
  if (session?.phone) {
    orders = orders.filter((o) => o.customerPhone === session.phone);
  } else if (phone) {
    orders = orders.filter((o) => o.customerPhone === phone);
  }

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
    const session = getUserSession(request);

  if (!session?.phone) {
    return NextResponse.json(
      { error: "Please login before placing an order." },
      { status: 401 }
    );
  }
  const body = await request.json();
  const { customerName, customerPhone, items, pickupTime, notes } = body;

  if (
  customerPhone !== session.phone ||
  customerName !== session.name
) {
  return unauthorizedResponse();
}

  const order = await createOrder({
    customerName,
    customerPhone,
    items,
    pickupTime,
    notes,
  });

  return NextResponse.json(order, { status: 201 });
}
