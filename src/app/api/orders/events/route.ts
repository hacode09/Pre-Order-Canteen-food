import { NextRequest, NextResponse } from "next/server";
import {
  getUserSession,
  isAdminRequest,
  unauthorizedResponse,
} from "@/lib/auth";
import { OrderChangeEvent, subscribeToOrderChanges } from "@/lib/order-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAdmin = isAdminRequest(request);
  const session = getUserSession(request);

  if (!isAdmin && !session?.phone) {
    return unauthorizedResponse();
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: OrderChangeEvent) => {
        if (!isAdmin && event.customerPhone !== session?.phone) return;

        controller.enqueue(
          encoder.encode(
            `event: order-change\ndata: ${JSON.stringify(event)}\n\n`
          )
        );
      };

      const unsubscribe = subscribeToOrderChanges(send);
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 25000);

      const cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // The browser may already have closed the stream.
        }
      };

      request.signal.addEventListener("abort", cleanup);
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
