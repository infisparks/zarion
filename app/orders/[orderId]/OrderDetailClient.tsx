"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../../lib/firebaseconfig";
import { ref as dbRef, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

interface OrderItem {
  productKey: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  addedAt: number;
}

interface Order {
  id: string;
  couponCode: string;
  discount: number;
  finalTotal: number;
  items: OrderItem[];
  orderTime: number;
  shippingAddress: string;
  status: string;
  estimatedDelivery: string;
  total: number;
}

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      // Fetch the order from "users/{uid}/orders/{orderId}"
      const orderRef = dbRef(database, `users/${currentUser.uid}/orders/${orderId}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        setOrder({ id: orderId, ...snapshot.val() });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          &larr; Back to Orders
        </button>
        <h1 className="text-3xl font-bold mb-4">Order Details</h1>
        <div className="space-y-2 mb-4">
          <p>
            <span className="font-semibold">Order ID:</span> {order.id}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {order.status}
          </p>
          <p>
            <span className="font-semibold">Order Time:</span>{" "}
            {new Date(order.orderTime).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">Estimated Delivery:</span>{" "}
            {order.estimatedDelivery}
          </p>
          <p>
            <span className="font-semibold">Shipping Address:</span>{" "}
            {order.shippingAddress}
          </p>
          {order.couponCode && (
            <p className="text-sm text-gray-600">
              Coupon: {order.couponCode} (Discount: {order.discount * 100}%)
            </p>
          )}
        </div>

        {/* Items Ordered */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center border-b pb-2"
              >
                <div className="w-full sm:w-24 flex-shrink-0 mb-2 sm:mb-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-24 object-cover rounded shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow sm:ml-4 text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{item.productName}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <p className="text-lg font-bold">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <p className="text-xl font-semibold">Total:</p>
            <p className="text-xl font-bold">₹{order.finalTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
