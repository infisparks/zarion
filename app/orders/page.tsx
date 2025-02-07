"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebaseconfig";
import { ref as dbRef, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

interface Order {
  id: string;
  couponCode: string;
  discount: number;
  finalTotal: number;
  orderTime: number;
  shippingAddress: string;
  status: string;
  estimatedDelivery: string;
  total: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      // Listen to orders in users/{uid}/orders
      const ordersRef = dbRef(database, `users/${currentUser.uid}/orders`);
      onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        const ordersArray: Order[] = [];
        if (data) {
          Object.keys(data).forEach((key) => {
            ordersArray.push({ id: key, ...data[key] });
          });
          // Optionally sort orders by orderTime (descending)
          ordersArray.sort((a, b) => b.orderTime - a.orderTime);
        }
        setOrders(ordersArray);
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">My Orders</h1>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">You have no orders.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold">Order ID: {order.id}</p>
                  <p className="text-sm text-gray-500">Status: {order.status}</p>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Order Time: {new Date(order.orderTime).toLocaleString()}
                  </p>
                  <p className="text-lg font-bold">₹{order.finalTotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
