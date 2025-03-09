"use client";

import Link from "next/link";
import { PlusCircle, Settings, List } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10">
      <h1 className="text-4xl font-bold mb-10">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        <Link
          href="/admin/upload"
          className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-2xl transition p-6 flex flex-col items-center"
        >
          <PlusCircle className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold">Add Cloth</h2>
        </Link>
        <Link
          href="/admin/managecloth"
          className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-2xl transition p-6 flex flex-col items-center"
        >
          <Settings className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold">Manage Cloth</h2>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-2xl transition p-6 flex flex-col items-center"
        >
          <List className="w-12 h-12 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold">All Orders</h2>
        </Link>
      </div>
    </div>
  );
}
