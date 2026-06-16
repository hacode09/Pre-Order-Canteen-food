"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.phone) {
          setCustomerPhone(data.phone);
        }
        if (data?.authenticated && data?.name) {
          setCustomerName(data.name);
        }
      })
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          pickupTime,
          notes: notes || undefined,
          items: items.map((i) => ({
            menuItemId: i.menuItem.id,
            name: i.menuItem.name,
            price: i.menuItem.price,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to place order");
      }

      const order = await res.json();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <span className="mb-4 block text-6xl">🛒</span>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>
        <p className="mb-6 text-gray-500">
          Add some delicious items from our menu!
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Your Cart</h1>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.menuItem.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4"
            >
              <span className="text-3xl">{item.menuItem.image}</span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.menuItem.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatCurrency(item.menuItem.price)} each
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.menuItem.id, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              <span className="w-20 text-right font-semibold">
                {formatCurrency(item.menuItem.price * item.quantity)}
              </span>
              <button
                onClick={() => removeItem(item.menuItem.id)}
                className="text-gray-400 hover:text-red-500"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-bold">Checkout</h2>

          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="10-digit mobile number"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Pickup Time
              </label>
              <input
                type="time"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Special Instructions (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                placeholder="Any special requests..."
              />
            </div>
          </div>

          <div className="mb-4 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-orange-600">{formatCurrency(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Pre-Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
