"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { database, auth } from "../../../lib/firebaseconfig";
import { ref as dbRef, get, push, serverTimestamp } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { ShoppingBag, Heart, X } from "lucide-react";
import Link from "next/link";
import LoginModal from "../../components/LoginModal";

interface Product {
  id?: string;
  productName: string;
  category: string;
  price: number;
  discount?: number; // Discounted price that the user pays
  stock: number;
  description: string;
  imageUrls: string[];
  sizes?: string[]; // Array of available sizes
  createdAt: number;
}

interface CartItemClientProps {
  productKey: string;
}

export default function CartItemClient({ productKey }: CartItemClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");

  // Listen to Firebase auth state to determine if a user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserLoggedIn(!!user);
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch product details from Firebase Realtime Database
  useEffect(() => {
    if (!productKey) return;
    const productRef = dbRef(database, `products/${productKey}`);
    get(productRef).then((snapshot) => {
      if (snapshot.exists()) {
        const productData = snapshot.val();
        setProduct({ id: productKey, ...productData });
      } else {
        setProduct(null);
      }
    });
  }, [productKey]);

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (price: number, discount: number) => {
    if (!price || price === 0) return 0;
    return Math.round(((price - discount) / price) * 100);
  };

  // Handle "Add to Cart" click
  const handleAddToCart = async () => {
    if (!userLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser) {
      alert("Please wait a moment...");
      return;
    }
    if (!product) {
      alert("Product not found!");
      return;
    }
    if (product.sizes && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    try {
      const uid = currentUser.uid;
      const priceToUse = product.discount ? product.discount : product.price;
      const cartItem = {
        productKey: product.id,
        productName: product.productName,
        quantity: quantity,
        price: priceToUse,
        size: selectedSize || null,
        addedAt: serverTimestamp(),
      };
      const cartRef = dbRef(database, `users/${uid}/cart`);
      await push(cartRef, cartItem);
      alert(`Added ${quantity} of ${product.productName} to your cart!`);
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(err.message || "Error adding product to cart.");
    }
  };

  // Handle "Buy Now" click – verify size selection then show shipping address popup
  const handleBuyNow = () => {
    if (!userLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser) {
      alert("Please wait a moment...");
      return;
    }
    if (!product) {
      alert("Product not found!");
      return;
    }
    if (product.sizes && !selectedSize) {
      alert("Please select a size.");
      return;
    }
    setShowShippingModal(true);
  };

  // Handle placing the order when shipping address is submitted
  const handlePlaceOrder = async () => {
    if (!shippingAddress.trim()) {
      alert("Please enter a valid shipping address.");
      return;
    }
    try {
      const uid = currentUser.uid;
      const priceToUse = product?.discount ? product.discount : product?.price;
      const total = (priceToUse as number) * quantity;
      // Set estimated delivery to 7 days from now
      const estimatedDelivery = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const orderItem = {
        addedAt: serverTimestamp(),
        id: product?.id,
        price: priceToUse,
        productImage:
          product?.imageUrls && product.imageUrls[0]
            ? product.imageUrls[0]
            : "",
        productKey: product?.id,
        productName: product?.productName,
        quantity: quantity,
        size: selectedSize || null,
      };
      const orderData = {
        estimatedDelivery,
        finalTotal: total,
        items: [orderItem],
        orderTime: serverTimestamp(),
        shippingAddress,
        status: "pending",
        total: total,
      };
      const ordersRef = dbRef(database, `users/${uid}/orders`);
      await push(ordersRef, orderData);
      alert("Order placed successfully!");
      setShowShippingModal(false);
      // Optionally, navigate to orders page or reset state
    } catch (err: any) {
      console.error("Error placing order:", err);
      alert(err.message || "Error placing order.");
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="transform transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Back to Shop
          </button>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 overflow-hidden border border-gray-100">
            <div className="md:flex">
              {/* Product Images */}
              <div className="md:w-1/2 p-6 bg-gray-50/50">
                <div className="aspect-square mb-4 rounded-xl overflow-hidden bg-white">
                  <img
                    src={
                      product?.imageUrls && product.imageUrls[selectedImage]
                        ? product.imageUrls[selectedImage]
                        : "https://via.placeholder.com/500"
                    }
                    alt={product?.productName}
                    className="w-full h-full object-contain object-center transition-transform hover:scale-105 duration-300"
                  />
                </div>
                {product?.imageUrls && product.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden ${
                          selectedImage === idx
                            ? "ring-2 ring-black ring-offset-2"
                            : "hover:opacity-80"
                        }`}
                      >
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`${product?.productName} ${idx + 1}`}
                          className="w-full h-full object-contain object-center"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      {product?.category}
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {product?.productName}
                    </h1>
                  </div>

                  {/* Price and Stock */}
                  <div className="space-y-1">
                    {product?.discount ? (
                      <>
                        <p className="text-3xl font-bold text-gray-900">
                          Rs. {product.discount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-gray-500">
                            Rs. {product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-green-600">
                            {getDiscountPercentage(product.price, product.discount)}% off
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">
                        Rs. {product?.price.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Stock Available: {product?.stock} units
                    </p>
                  </div>

                  {/* Product Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {product?.description}
                  </p>

                  {/* Available Sizes */}
                  {product?.sizes && product.sizes.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Available Sizes
                      </h4>
                      <div className="flex gap-2 mt-1">
                        {product.sizes.map((size, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1 border rounded text-sm ${
                              selectedSize === size
                                ? "bg-black text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Quantity and Action Buttons */}
                <div className="mt-8 space-y-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={product?.stock}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(1, Number(e.target.value)))
                        }
                        className="w-16 text-center border border-gray-300 rounded-md py-1.5 text-sm focus:ring-1 focus:ring-black focus:border-black"
                      />
                      <button
                        onClick={() =>
                          setQuantity(Math.min(product?.stock || 1, quantity + 1))
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl hover:bg-black/90 active:bg-black/80 transition-colors duration-200"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-medium">
                        Add {quantity} to Cart
                      </span>
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 flex items-center justify-center gap-2 border border-black text-black py-3.5 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <span className="font-medium">Buy Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Shipping Address Modal for "Buy Now" */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Enter Shipping Address
            </h2>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your full shipping address"
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowShippingModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
