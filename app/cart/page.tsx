"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, database } from "../../lib/firebaseconfig";
import {
  ref as dbRef,
  onValue,
  push,
  remove,
  serverTimestamp,
  get,
  update,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

// Updated interface now includes a "size" field.
interface RawCartItem {
  productKey: string;
  productName: string;
  quantity: number;
  price: number;
  addedAt: number;
  size?: string;
}

// This interface is what we'll display in the cart UI
interface CartItem extends RawCartItem {
  id: string; // The unique cart item ID from Realtime Database
  productImage?: string; // We'll fetch from products/{productKey}
}

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);

  // Coupon code & discount (as a decimal percentage)
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0); // e.g. 0.1 means 10%

  // Estimated delivery: current date + 5 days
  const getEstimatedDelivery = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Listen to auth state changes and fetch user cart and address
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch user's shipping address from "users/{uid}/address"
      const userRef = dbRef(database, `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.address) {
            setShippingAddress(data.address);
          }
        }
      });

      // Fetch the user's cart items from "users/{uid}/cart"
      const cartRef = dbRef(database, `users/${currentUser.uid}/cart`);
      onValue(cartRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setCartItems([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        // Data is an object keyed by cart item ID
        const entries = Object.entries<RawCartItem>(data);
        let sum = 0;
        const itemPromises = entries.map(async ([cartItemId, cartItem]) => {
          let productImage = "";
          // Dynamically fetch the product node to get imageUrls[0]
          const productSnap = await get(
            dbRef(database, `products/${cartItem.productKey}`)
          );
          if (productSnap.exists()) {
            const productData = productSnap.val() as { imageUrls?: string[] };
            productImage = productData.imageUrls?.[0] || "";
          }
          sum += cartItem.price * cartItem.quantity;
          return {
            id: cartItemId,
            productKey: cartItem.productKey,
            productName: cartItem.productName,
            productImage,
            quantity: cartItem.quantity,
            price: cartItem.price,
            addedAt: cartItem.addedAt,
            size: cartItem.size, // Include size if available
          };
        });

        const enrichedItems = await Promise.all(itemPromises);
        setCartItems(enrichedItems);
        setTotal(sum);
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, [router]);

  // Apply coupon discount: if coupon code is "SAVE10", apply 10% discount
  useEffect(() => {
    if (couponCode.trim().toUpperCase() === "SAVE10") {
      setDiscount(0.1);
    } else {
      setDiscount(0);
    }
  }, [couponCode]);

  const finalTotal = total * (1 - discount);

  // Delete a cart item
  const handleDeleteItem = async (cartItemId: string) => {
    if (!user) return;
    try {
      const itemRef = dbRef(database, `users/${user.uid}/cart/${cartItemId}`);
      await remove(itemRef);
      alert("Item deleted from cart.");
    } catch (err: any) {
      console.error("Error deleting cart item:", err);
      alert(err.message || "Error deleting item.");
    }
  };

  // Handle "Buy Now" click:
  // 1. Validate that shipping address is provided.
  // 2. Generate a new order under "users/{uid}/orders" with order details.
  // 3. Clear the cart items.
  // 4. Save order status as "pending".
  const handleBuy = async () => {
    if (!user) return;
    if (!shippingAddress.trim()) {
      alert("Please provide a shipping address.");
      setEditingAddress(true);
      return;
    }
    try {
      const ordersRef = dbRef(database, `users/${user.uid}/orders`);
      await push(ordersRef, {
        items: cartItems,
        total,
        discount,
        finalTotal,
        shippingAddress,
        couponCode: couponCode.trim(),
        orderTime: serverTimestamp(),
        estimatedDelivery: getEstimatedDelivery(),
        status: "pending", // Set order status to pending
      });
      // Clear the cart
      const cartRef = dbRef(database, `users/${user.uid}/cart`);
      await remove(cartRef);
      alert("Order placed successfully!");
      router.push("/");
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert(err.message || "Error placing order.");
    }
  };

  // Save or update shipping address in the user node
  const handleSaveAddress = async () => {
    if (!user) return;
    if (!shippingAddress.trim()) {
      alert("Please enter a valid address.");
      return;
    }
    try {
      const userRef = dbRef(database, `users/${user.uid}`);
      await update(userRef, { address: shippingAddress });
      setEditingAddress(false);
      alert("Shipping address saved.");
    } catch (err: any) {
      console.error("Error saving address:", err);
      alert(err.message || "Error saving address.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20 px-4">
      <div className="container mx-auto max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-600 text-center">Your cart is empty.</p>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center sm:items-start border-b pb-4"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 flex-shrink-0 mb-4 sm:mb-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow sm:ml-4 text-center sm:text-left">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.productName}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    {item.size && (
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    )}
                  </div>

                  {/* Price & Delete Option */}
                  <div className="mt-2 sm:mt-0 flex flex-col items-center gap-2">
                    <p className="text-lg font-bold text-gray-800">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Coupon */}
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <h2 className="text-2xl font-bold">Subtotal:</h2>
                <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code (e.g., SAVE10)"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
              {discount > 0 && (
                <p className="mt-2 text-green-600">
                  Coupon applied! You saved {discount * 100}% off.
                </p>
              )}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                <h2 className="text-2xl font-bold">Final Total:</h2>
                <p className="text-2xl font-bold">₹{finalTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-8 border-t pt-4">
              <h2 className="text-xl font-bold mb-2">Shipping Address</h2>
              {editingAddress || !shippingAddress ? (
                <div className="space-y-2">
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter your shipping address"
                    className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <button
                    onClick={handleSaveAddress}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                  >
                    Save Address
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-700">{shippingAddress}</p>
                  <button
                    onClick={() => setEditingAddress(true)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Estimate */}
            <div className="mt-6 border-t pt-4">
              <p className="text-gray-600">
                Estimated Delivery: {getEstimatedDelivery()}
              </p>
            </div>

            {/* Buy Now Button */}
            <div className="mt-8">
              <button
                onClick={handleBuy}
                className="w-full bg-black text-white py-3 rounded-lg text-lg font-semibold hover:bg-black/90 transition"
              >
                Buy Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
