import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  RevenueStats,
} from "@/types";
import { emitOrderChange } from "./order-events";
import { SEED_MENU } from "./seed";
const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function toMenuItem(item: {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number;
}): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category as MenuCategory,
    image: item.image,
    available: item.available,
    prepTime: item.prepTime,
  };
}

// Initialize menu with seed data if empty
async function initializeMenu() {
  const count = await prisma.menuItem.count();
  if (count === 0) {
    await prisma.menuItem.createMany({
      data: SEED_MENU,
      skipDuplicates: true,
    });
  }
}

export async function getMenu(): Promise<MenuItem[]> {
  try {
    await initializeMenu();
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: "asc" },
    });
    return items.map(toMenuItem);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return SEED_MENU;
  }
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
    });
    return item ? toMenuItem(item) : undefined;
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return undefined;
  }
}

export async function addMenuItem(
  item: Omit<MenuItem, "id">
): Promise<MenuItem> {
  try {
    const newItem = await prisma.menuItem.create({
      data: {
        ...item,
        id: uuidv4(),
      },
    });
    return toMenuItem(newItem);
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
}

export async function updateMenuItem(
  id: string,
  updates: Partial<MenuItem>
): Promise<MenuItem | null> {
  try {
    const updated = await prisma.menuItem.update({
      where: { id },
      data: updates,
    });
    return toMenuItem(updated);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return null;
  }
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    await prisma.menuItem.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return false;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => ({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status as Order["status"],
      pickupTime: order.pickupTime,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getOrder(id: string): Promise<Order | undefined> {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return undefined;
    return {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status as Order["status"],
      pickupTime: order.pickupTime,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return undefined;
  }
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  pickupTime: string;
  notes?: string;
}): Promise<Order> {
  try {
    const total = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const now = new Date();
    const orderId = uuidv4().slice(0, 8).toUpperCase();

    const order = await prisma.order.create({
      data: {
        id: orderId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        total,
        status: "pending",
        pickupTime: data.pickupTime,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
        items: {
          create: data.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    emitOrderChange({
      type: "created",
      orderId: order.id,
      customerPhone: order.customerPhone,
      status: order.status as Order["status"],
    });

    return {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status as Order["status"],
      pickupTime: order.pickupTime,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    emitOrderChange({
      type: "updated",
      orderId: order.id,
      customerPhone: order.customerPhone,
      status: order.status as Order["status"],
    });

    return {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      total: order.total,
      status: order.status as Order["status"],
      pickupTime: order.pickupTime,
      notes: order.notes || undefined,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return null;
  }
}

export async function getRevenueStats(): Promise<RevenueStats> {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
    });
    const menu = await getMenu();
    const menuMap = new Map(menu.map((m) => [m.id, m]));

    const completed = orders.filter((o) => o.status === "completed");
    const cancelled = orders.filter((o) => o.status === "cancelled");

    const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);

    const revenueByCategory: Record<string, number> = {};
    const itemStats: Record<string, { quantity: number; revenue: number }> =
      {};
    const dayMap: Record<string, { revenue: number; orders: number }> = {};

    for (const order of completed) {
      const day = order.createdAt.toISOString().split("T")[0];
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
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      averageOrderValue: 0,
      revenueByCategory: {},
      revenueByDay: [],
      topItems: [],
    };
  }
}
