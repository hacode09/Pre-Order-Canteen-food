"use client";

import { useEffect, useState } from "react";
import { MenuItem, MenuCategory, CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "lunch" as MenuCategory,
  image: "🍽️",
  prepTime: "10",
  available: true,
};

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchMenu = () => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then(setMenu);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      image: item.image,
      prepTime: String(item.prepTime),
      available: item.available,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      prepTime: Number(form.prepTime),
    };

    if (editingId) {
      await fetch(`/api/menu/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    fetchMenu();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    fetchMenu();
  };

  const toggleAvailable = async (item: MenuItem) => {
    await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    fetchMenu();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button
          onClick={openCreate}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          + Add Item
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-5"
        >
          <h2 className="mb-4 font-semibold">
            {editingId ? "Edit Item" : "New Menu Item"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              required
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              required
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="col-span-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as MenuCategory,
                })
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <input
              placeholder="Emoji icon"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Prep time (min)"
              value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              Available
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {menu.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center"
          >
            <span className="text-3xl">{item.image}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {CATEGORY_LABELS[item.category]}
                </span>
                {!item.available && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                    Unavailable
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <span className="font-bold text-orange-600">
              {formatCurrency(item.price)}
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => toggleAvailable(item)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
              >
                {item.available ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => openEdit(item)}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
