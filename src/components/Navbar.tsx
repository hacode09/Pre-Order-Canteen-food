"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Menu" },
  { href: "/orders", label: "My Orders" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { name, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="text-lg font-bold text-orange-600">
            Canteen<span className="text-gray-800">Pre</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href))
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-orange-200 bg-white p-2 text-orange-600 transition hover:bg-orange-50 sm:hidden"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          <span className="text-lg">☰</span>
        </button>

        {mobileNavOpen && (
          <div className="absolute left-4 right-4 top-full z-50 mt-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl sm:hidden">
            <div className="space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href))
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-orange-50 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!loading && name ? (
                <button
                  onClick={handleLogout}
                  className="w-full rounded-2xl bg-orange-50 px-4 py-3 text-left text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
                >
                  Log out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                  onClick={() => setMobileNavOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!loading && name ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
                aria-expanded={menuOpen}
              >
                {name}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 bg-white shadow-xl">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-orange-50"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              Login
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
