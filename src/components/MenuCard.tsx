"use client";

import { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const { addItem } = useCart();
const { authenticated } = useAuth();
const router = useRouter();

const handleAddToCart = () => {
  if (!authenticated) {
    router.push("/login");
    return;
  }

  addItem(item);
};

  return (
    <div
      className={`group flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md ${
        !item.available ? "opacity-60" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="text-4xl">{item.image}</span>
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
          {item.prepTime} min
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-gray-900">{item.name}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-500">
        {item.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-orange-600">
          {formatCurrency(item.price)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={!item.available}
          
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {item.available ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
}
