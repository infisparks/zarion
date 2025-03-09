// app/admin/layout.tsx
import "../globals.css"; // Adjust path as needed
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin - Zarion",
  description: "Admin dashboard for Zarion",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen pt-16 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
