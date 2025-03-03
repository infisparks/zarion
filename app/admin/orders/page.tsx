"use client";

import { useState, useEffect } from "react";
import { database } from "../../../lib/firebaseconfig";
import { ref as dbRef, onValue, update } from "firebase/database";
import { X, ShoppingBag, CheckCircle } from "lucide-react";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  productKey: string;
  addedAt: number;
  size?: string;
}

interface Order {
  id: string; // Order key
  uid: string; // User ID who placed the order
  displayName: string; // User's display name
  email: string;       // User's email
  phone: string;       // User's phone number
  shippingAddress: string;
  couponCode: string;
  orderTime: number;
  estimatedDelivery: string;
  status: string;
  total: number;
  discount: number;
  finalTotal: number;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Listen to the "users" node and iterate through orders for each user
    const usersRef = dbRef(database, "users");
    onValue(usersRef, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((userSnap) => {
        const uid = userSnap.key;
        const userData = userSnap.val();
        // Get user details
        const displayName = userData.displayName || "N/A";
        const email = userData.email || "N/A";
        const phone = userData.phone || "N/A";
        if (userData && userData.orders) {
          Object.entries(userData.orders).forEach(([orderKey, orderData]) => {
            ordersList.push({
              id: orderKey,
              uid: uid || "",
              displayName,
              email,
              phone,
              ...(orderData as object),
            } as Order);
          });
        }
      });
      setOrders(ordersList);
      setLoading(false);
    });
  }, []);

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const orderRef = dbRef(
        database,
        `users/${selectedOrder.uid}/orders/${selectedOrder.id}`
      );
      await update(orderRef, { status: newStatus });
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      alert(`Order status updated to ${newStatus}.`);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      alert(error.message || "Error updating order status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Orders</h1>
        {orders.length === 0 ? (
          <p className="text-center text-gray-600">No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-4 rounded-lg shadow-lg border cursor-pointer hover:shadow-xl transition"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Order {order.id}</h2>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(order.orderTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-gray-700 font-medium">
                    Final Total: ₹{order.finalTotal.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="font-semibold">{order.status}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery: {order.estimatedDelivery}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal with Scrollable Content */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Order Details
            </h2>
            <div className="mb-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Order ID:</span> {selectedOrder.id}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Order Date:</span>{" "}
                {new Date(selectedOrder.orderTime).toLocaleString()}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {selectedOrder.displayName}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {selectedOrder.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Phone:</span> {selectedOrder.phone}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Shipping Address:</span>{" "}
                {selectedOrder.shippingAddress}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {selectedOrder.estimatedDelivery}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Coupon Code:</span>{" "}
                {selectedOrder.couponCode || "N/A"}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Items</h3>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 mb-4 border-b pb-2">
                  <img
                    src={item.productImage || "https://via.placeholder.com/100"}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{item.productName}</h4>
                    {item.size && (
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} x ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-bold text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4 flex justify-between">
              <p className="text-lg font-semibold">Final Total:</p>
              <p className="text-lg font-semibold">₹{selectedOrder.finalTotal.toFixed(2)}</p>
            </div>
            {/* Order Status Buttons */}
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => updateOrderStatus("pending")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Pending
              </button>
              <button
                onClick={() => updateOrderStatus("delivered")}
                className="px-4 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 transition"
              >
                Delivered
              </button>
              <button
                onClick={() => updateOrderStatus("completed")}
                className="px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition"
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
