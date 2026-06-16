import { NextRequest, NextResponse } from "next/server";
import {
  getUserSession,
  isAdminRequest,
  unauthorizedResponse,
} from "@/lib/auth";
import { getOrder, updateOrderStatus } from "@/lib/store";
import { OrderStatus } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const session = getUserSession(request);
  if (!isAdminRequest(request) && order.customerPhone !== session?.phone) {
    return unauthorizedResponse();
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: OrderStatus };

  if (!status) {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  const order = updateOrderStatus(id, status);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
