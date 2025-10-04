import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "./components/AdminShell";

export const metadata: Metadata = {
  title: "Simply Signed Admin",
  description: "Admin panel for Simply Signed content management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
