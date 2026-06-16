import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest, unauthorizedResponse } from "@/lib/auth";
import { addMenuItem, getMenu } from "@/lib/store";
import { MenuCategory } from "@/types";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");
  let menu = getMenu();
  if (category) {
    menu = menu.filter((item) => item.category === category);
  }
  return NextResponse.json(menu);
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const body = await request.json();
  const { name, description, price, category, image, available, prepTime } =
    body;

  if (!name || !description || price == null || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const item = addMenuItem({
    name,
    description,
    price: Number(price),
    category: category as MenuCategory,
    image: image || "🍽️",
    available: available ?? true,
    prepTime: Number(prepTime) || 10,
  });

  return NextResponse.json(item, { status: 201 });
}
