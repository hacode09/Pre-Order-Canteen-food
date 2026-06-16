import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "admin-session";
const SESSION_VALUE = "authenticated";
export const USER_SESSION_COOKIE = "user-session";
export const USER_SESSION_PHONE_COOKIE = "user-phone";
export const USER_SESSION_NAME_COOKIE = "user-name";

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function isAdminRequest(request: NextRequest): boolean {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function setAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}

export function validatePhone(phone?: string) {
  return typeof phone === "string" && /^\d{10}$/.test(phone.trim());
}

export function isUserRequest(request: NextRequest): boolean {
  return Boolean(request.cookies.get(USER_SESSION_COOKIE)?.value === SESSION_VALUE);
}

export function getUserSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(USER_SESSION_COOKIE)?.value;
  const phone = request.cookies.get(USER_SESSION_PHONE_COOKIE)?.value;
  const name = request.cookies.get(USER_SESSION_NAME_COOKIE)?.value;
  if (sessionCookie === SESSION_VALUE && phone && name) {
    return { phone, name };
  }
  return null;
}

export function setUserSession(response: NextResponse, phone: string, name: string) {
  response.cookies.set(USER_SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(USER_SESSION_PHONE_COOKIE, phone, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set(USER_SESSION_NAME_COOKIE, name, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearUserSession(response: NextResponse) {
  response.cookies.delete(USER_SESSION_COOKIE);
  response.cookies.delete(USER_SESSION_PHONE_COOKIE);
  response.cookies.delete(USER_SESSION_NAME_COOKIE);
  return response;
}
