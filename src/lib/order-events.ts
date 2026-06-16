import { EventEmitter } from "events";
import { OrderStatus } from "@/types";

export type OrderChangeEvent = {
  type: "created" | "updated";
  orderId: string;
  customerPhone: string;
  status?: OrderStatus;
};

const ORDER_CHANGE_EVENT = "order-change";

const globalForOrderEvents = global as unknown as {
  orderEvents?: EventEmitter;
};

const orderEvents = globalForOrderEvents.orderEvents ?? new EventEmitter();
orderEvents.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalForOrderEvents.orderEvents = orderEvents;
}

export function emitOrderChange(event: OrderChangeEvent) {
  orderEvents.emit(ORDER_CHANGE_EVENT, event);
}

export function subscribeToOrderChanges(
  listener: (event: OrderChangeEvent) => void
) {
  orderEvents.on(ORDER_CHANGE_EVENT, listener);

  return () => {
    orderEvents.off(ORDER_CHANGE_EVENT, listener);
  };
}
