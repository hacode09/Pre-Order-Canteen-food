"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import OrderTracker from "@/components/OrderTracker";
import { Order } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = () => {
      fetch(`/api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setOrder(data);
          setLoading(false);
        });
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-40 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <h1 className="mb-2 text-2xl font-bold">Order Not Found</h1>
        <Link href="/orders" className="text-orange-600 hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Order Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Customer</dt>
              <dd className="font-medium">{order.customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{order.customerPhone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Placed at</dt>
              <dd className="font-medium">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Pickup time</dt>
              <dd className="font-medium">{formatTime(order.pickupTime)}</dd>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Notes</dt>
                <dd className="font-medium">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Items</h2>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.name}{" "}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 font-bold">
            <span>Total</span>
            <span className="text-orange-600">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-6 font-semibold text-gray-900">Order Status</h2>
        <OrderTracker status={order.status} />
        <p className="mt-4 text-xs text-gray-400">
          Status updates automatically every 10 seconds.
        </p>
      </div>
    </div>
  );
}
