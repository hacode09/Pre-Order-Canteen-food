"use client";

import { useEffect, useState } from "react";
import { RevenueStats, CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function RevenuePage() {
  const [stats, setStats] = useState<RevenueStats | null>(null);

  useEffect(() => {
    fetch("/api/revenue")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const maxDayRevenue = Math.max(
    ...stats.revenueByDay.map((d) => d.revenue),
    1
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Revenue Reporting
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue) },
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Completed", value: stats.completedOrders },
          { label: "Cancelled", value: stats.cancelledOrders },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-5"
          >
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 font-semibold">Revenue by Category</h2>
          {Object.keys(stats.revenueByCategory).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.revenueByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, revenue]) => {
                  const pct =
                    stats.totalRevenue > 0
                      ? (revenue / stats.totalRevenue) * 100
                      : 0;
                  return (
                    <div key={cat}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>
                          {CATEGORY_LABELS[
                            cat as keyof typeof CATEGORY_LABELS
                          ] ?? cat}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(revenue)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 font-semibold">Top Selling Items</h2>
          {stats.topItems.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topItems.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity} sold
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-orange-600">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 font-semibold">Daily Revenue (Last 7 Days)</h2>
        {stats.revenueByDay.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="flex items-end gap-3" style={{ height: 200 }}>
            {stats.revenueByDay.map((day) => (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-xs font-medium text-orange-600">
                  {formatCurrency(day.revenue)}
                </span>
                <div
                  className="w-full rounded-t-lg bg-orange-400 transition-all"
                  style={{
                    height: `${(day.revenue / maxDayRevenue) * 140}px`,
                    minHeight: day.revenue > 0 ? 8 : 2,
                  }}
                />
                <span className="text-[10px] text-gray-400">
                  {new Date(day.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <span className="text-[10px] text-gray-300">
                  {day.orders} orders
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
