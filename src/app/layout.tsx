import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanteenPre — Pre-Order Your Food",
  description:
    "Browse the menu, pre-order food, and track your order status at your canteen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
