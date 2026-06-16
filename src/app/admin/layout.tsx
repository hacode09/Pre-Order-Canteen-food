export const metadata = {
  title: "CanteenPre Admin",
  description: "Admin dashboard for canteen staff",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
