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

  let orders = getOrders();
  if (session?.phone) {
    orders = orders.filter((o) => o.customerPhone === session.phone);
  } else if (phone) {
    orders = orders.filter((o) => o.customerPhone === phone);
  }

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerName, customerPhone, items, pickupTime, notes } = body;

  if (!customerName || !customerPhone || !items?.length || !pickupTime) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const order = createOrder({
    customerName,
    customerPhone,
    items,
    pickupTime,
    notes,
  });

  return NextResponse.json(order, { status: 201 });
}
