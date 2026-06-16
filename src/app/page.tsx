"use client";

import { useEffect, useState } from "react";
import MenuCard from "@/components/MenuCard";
import { MenuItem, MenuCategory, CATEGORY_LABELS } from "@/types";

const categories: (MenuCategory | "all")[] = [
  "all",
  "breakfast",
  "lunch",
  "snacks",
  "beverages",
  "desserts",
];

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<MenuCategory | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        setLoading(false);
      });
  }, []);

  const filtered =
    category === "all"
      ? menu
      : menu.filter((item) => item.category === category);

  return (
    <div>
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white">
        <h1 className="mb-2 text-3xl font-bold">Pre-Order Your Meal</h1>
        <p className="text-orange-100">
          Browse our menu, add items to your cart, and pick up at your
          scheduled time — skip the queue!
        </p>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 shadow-sm hover:bg-orange-50"
            }`}
          >
            {cat === "all" ? "All Items" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No items in this category.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
