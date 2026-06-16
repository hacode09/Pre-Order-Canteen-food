"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Order } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export default function OrdersPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.name && data?.phone) {
          setUserName(data.name);
          setUserPhone(data.phone);
          setUserMessage(`Welcome back, ${data.name}. Showing your orders.`);
          fetchOrders();
        }
      })
      .catch(() => undefined);
  }, []);

  const fetchOrders = async (searchPhone?: string) => {
    setLoading(true);
    const query = searchPhone ? `?phone=${encodeURIComponent(searchPhone)}` : "";
    const res = await fetch(`/api/orders${query}`);
    const data = await res.json();
    setOrders(data || []);
    setSearched(true);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    if (userPhone) {
      setUserMessage("You are logged in and can only view your own orders.");
      return;
    }
    setUserMessage("");
    await fetchOrders(phone.trim());
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">My Orders</h1>
      <p className="mb-6 text-gray-500">
        {userName
          ? "Your orders are loaded automatically because you are logged in."
          : "Log in with your phone to see your latest orders instantly."}
      </p>

      {!userName && (
        <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Orders"}
          </button>
        </form>
      )}

      {userMessage && (
        <p className="mb-6 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {userMessage}
        </p>
      )}

      {searched && orders.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          No orders found for this phone number.
        </p>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded-2xl border border-gray-100 bg-white p-5 transition hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-gray-900">
                #{order.id}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
              <span>{formatDate(order.createdAt)}</span>
              <span>Pickup: {formatTime(order.pickupTime)}</span>
              <span>{order.items.length} item(s)</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
