import type { Metadata } from "next";
import { AdminHeader } from "./AdminHeader";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-w-0 bg-dark">
      <AdminHeader />
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 text-gray-100">{children}</main>
    </div>
  );
}
