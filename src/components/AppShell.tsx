"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </CartProvider>
    </AuthProvider>
  );
}
