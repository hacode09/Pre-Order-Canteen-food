import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { MenuItem, Order, OrderItem, RevenueStats } from "@/types";
import { SEED_MENU } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const MENU_FILE = path.join(DATA_DIR, "menu.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filePath: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filePath: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getMenu(): MenuItem[] {
  return readJson<MenuItem[]>(MENU_FILE, SEED_MENU);
}

export function getMenuItem(id: string): MenuItem | undefined {
  return getMenu().find((item) => item.id === id);
}

export function addMenuItem(item: Omit<MenuItem, "id">): MenuItem {
  const menu = getMenu();
  const newItem: MenuItem = { ...item, id: uuidv4() };
  menu.push(newItem);
  writeJson(MENU_FILE, menu);
  return newItem;
}

export function updateMenuItem(
  id: string,
  updates: Partial<MenuItem>
): MenuItem | null {
  const menu = getMenu();
  const index = menu.findIndex((item) => item.id === id);
  if (index === -1) return null;
  menu[index] = { ...menu[index], ...updates, id };
  writeJson(MENU_FILE, menu);
  return menu[index];
}

export function deleteMenuItem(id: string): boolean {
  const menu = getMenu();
  const filtered = menu.filter((item) => item.id !== id);
  if (filtered.length === menu.length) return false;
  writeJson(MENU_FILE, filtered);
  return true;
}

export function getOrders(): Order[] {
  return readJson<Order[]>(ORDERS_FILE, []);
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find((order) => order.id === id);
}

export function createOrder(data: {
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  pickupTime: string;
  notes?: string;
}): Order {
  const orders = getOrders();
  const total = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const now = new Date().toISOString();
  const order: Order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    ...data,
    total,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"]
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) return null;
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  writeJson(ORDERS_FILE, orders);
  return orders[index];
}

export function getRevenueStats(): RevenueStats {
  const orders = getOrders();
  const menu = getMenu();
  const menuMap = new Map(menu.map((m) => [m.id, m]));

  const completed = orders.filter((o) => o.status === "completed");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);

  const revenueByCategory: Record<string, number> = {};
  const itemStats: Record<string, { quantity: number; revenue: number }> = {};
  const dayMap: Record<string, { revenue: number; orders: number }> = {};

  for (const order of completed) {
    const day = order.createdAt.split("T")[0];
    if (!dayMap[day]) dayMap[day] = { revenue: 0, orders: 0 };
    dayMap[day].revenue += order.total;
    dayMap[day].orders += 1;

    for (const item of order.items) {
      const menuItem = menuMap.get(item.menuItemId);
      const category = menuItem?.category ?? "other";
      revenueByCategory[category] =
        (revenueByCategory[category] ?? 0) + item.price * item.quantity;

      if (!itemStats[item.name]) {
        itemStats[item.name] = { quantity: 0, revenue: 0 };
      }
      itemStats[item.name].quantity += item.quantity;
      itemStats[item.name].revenue += item.price * item.quantity;
    }
  }

  const revenueByDay = Object.entries(dayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  const topItems = Object.entries(itemStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completed.length,
    cancelledOrders: cancelled.length,
    averageOrderValue:
      completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0,
    revenueByCategory,
    revenueByDay,
    topItems,
  };
}
