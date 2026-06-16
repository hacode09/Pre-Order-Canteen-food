"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
  { href: "/admin/menu", label: "Menu", icon: "🍽️" },
  { href: "/admin/revenue", label: "Revenue", icon: "💰" },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <p className="text-lg font-bold">CanteenPre Admin</p>
            <p className="text-xs text-gray-400">Staff access only</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
        >
          Logout
        </button>
      </div>

      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === link.href
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
