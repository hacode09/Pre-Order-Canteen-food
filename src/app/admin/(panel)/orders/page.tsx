"use client";

import { useEffect, useState } from "react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Order, OrderStatus, ORDER_STATUS_LABELS } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | OrderStatus>("all");

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then(setOrders);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active")
      return !["completed", "cancelled"].includes(o.status);
    return o.status === filter;
  });

  const statusOptions: (typeof filter)[] = [
    "all",
    "active",
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "completed",
    "cancelled",
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Order Management
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
              filter === s
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 shadow-sm hover:bg-orange-50"
            }`}
          >
            {s === "all"
              ? "All"
              : s === "active"
                ? "Active"
                : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No orders found.</p>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-100 bg-white p-5"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold">
                    #{order.id}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(order.total)}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                <span>{order.customerName}</span>
                <span>{order.customerPhone}</span>
                <span>Pickup: {formatTime(order.pickupTime)}</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>

              <div className="mb-4 text-sm">
                {order.items.map((item, i) => (
                  <span key={i} className="mr-3 text-gray-600">
                    {item.name} ×{item.quantity}
                  </span>
                ))}
                {order.notes && (
                  <p className="mt-1 text-gray-400 italic">
                    Note: {order.notes}
                  </p>
                )}
              </div>

              {order.status !== "completed" && order.status !== "cancelled" && (
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "confirmed",
                      "preparing",
                      "ready",
                      "completed",
                      "cancelled",
                    ] as OrderStatus[]
                  ).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      disabled={order.status === status}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        order.status === status
                          ? "bg-gray-100 text-gray-400"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
