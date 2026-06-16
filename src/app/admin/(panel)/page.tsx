"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Order, RevenueStats } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<RevenueStats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/revenue").then((r) => r.json()),
    ]).then(([ordersData, statsData]) => {
      setOrders(ordersData);
      setStats(statsData);
    });
  }, []);

  const activeOrders = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status)
  );

  const statCards = [
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: "📋",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: "💰",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Completed Orders",
      value: stats?.completedOrders ?? 0,
      icon: "✅",
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(stats?.averageOrderValue ?? 0),
      icon: "📈",
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${card.color}`}
              >
                Live
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <div>
                  <span className="font-mono text-sm font-bold">
                    #{order.id}
                  </span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-sm text-gray-600">
                    {order.customerName}
                  </span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(order.total)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
