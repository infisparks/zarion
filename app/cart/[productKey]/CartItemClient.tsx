// app/cart/[productKey]/CartItemClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { database, auth } from "../../../lib/firebaseconfig";
import { ref as dbRef, get, push, serverTimestamp } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { ShoppingBag } from "lucide-react";
import LoginModal from "../../components/LoginModal";

interface Product {
  id?: string;
  productName: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  description: string;
  imageUrls: string[];
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

  // Handle "Add to Cart" click:
  // - If user is not logged in, show the login modal.
  // - If user is logged in, save the cart product details under "users/{uid}/cart".
  const handleAddToCart = async () => {
    if (!userLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (!currentUser) {
      // In the unlikely event the auth state is not yet set
      alert("Please wait a moment...");
      return;
    }
    if (!product) {
      alert("Product not found!");
      return;
    }
    try {
      const uid = currentUser.uid;
      // Build the cart item data. You can add additional fields as needed.
      const cartItem = {
        productKey: product.id,
        productName: product.productName,
        quantity: quantity,
        price: product.price,
        addedAt: serverTimestamp(),
      };

      // Push the new cart item into the user's cart node
      const cartRef = dbRef(database, `users/${uid}/cart`);
      await push(cartRef, cartItem);

      alert(`Added ${quantity} of ${product.productName} to your cart!`);
      // Optionally, you could navigate to a cart page or update local UI state
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      alert(err.message || "Error adding product to cart.");
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
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
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
                          className="w-full h-full object-cover"
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
                    <p className="text-sm text-gray-500">
                      SKU: {product?.sku}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-gray-900">
                      ${product?.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock Available: {product?.stock} units
                    </p>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {product?.description}
                  </p>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setQuantity(Math.max(1, quantity - 1))
                        }
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
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-xl hover:bg-black/90 active:bg-black/80 transition-colors duration-200"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">
                      Add {quantity} to Cart
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
