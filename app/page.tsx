"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { database } from "../lib/firebaseconfig";
import { ref as dbRef, onValue } from "firebase/database";

interface Product {
  id?: string;
  productName: string;
  category: string;
  price: number;
  discount?: number;
  stock: number;
  sku?: string;
  description: string;
  imageUrls: string[];
  sizes?: string[];
  createdAt: number;
}

export default function Home() {
  // State to track the currently selected category filter.
  // "All Mens Wear" is used as the catch-all to show every product.
  const [selectedCategory, setSelectedCategory] = useState("All Mens Wear");

  return (
    <main className="min-h-screen bg-gray-50">
      <CategoriesNavigation 
        selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} 
      />
      <ProductsSection selectedCategory={selectedCategory} />
    </main>
  );
}

interface CategoriesNavigationProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const CategoriesNavigation = ({
  selectedCategory,
  setSelectedCategory,
}: CategoriesNavigationProps) => {
  const categories = [
    { title: "T-shirt", icon: "👕" },
    { title: "Shirt", icon: "👔" },
    { title: "Udy", icon: "🧥" },
    { title: "Pent", icon: "👖" },
    { title: "Trouser", icon: "👖" },
    { title: "All Mens Wear", icon: "🛍️" },
  ];

  return (
    <nav className="sticky top-0 bg-white shadow-sm z-10 md:mt-20">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide py-3 space-x-6">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.title)}
              className={`flex-shrink-0 flex items-center space-x-2 text-gray-600 hover:text-black transition-colors ${
                selectedCategory === category.title ? "font-bold" : ""
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span className="text-sm font-medium">{category.title}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

interface ProductsSectionProps {
  selectedCategory: string;
}

const ProductsSection = ({ selectedCategory }: ProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsRef = dbRef(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productArray: Product[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setProducts(productArray);
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter products based on the selected category.
  // If "All Mens Wear" is selected, show all products.
  const filteredProducts =
    selectedCategory === "All Mens Wear"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const getDiscountPercentage = (price: number, discount?: number): number => {
    if (discount === undefined || price === 0) return 0;
    return Math.round(((price - discount) / price) * 100);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 px-2">New Arrivals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/cart/${product.id}`}>
              <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative aspect-square">
                  <img
                    src={
                      product.imageUrls?.[0] ||
                      "https://via.placeholder.com/300"
                    }
                    alt={product.productName}
                    className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {getDiscountPercentage(product.price, product.discount)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Rs.{" "}
                      {product.discount
                        ? product.discount.toFixed(2)
                        : product.price.toFixed(2)}
                    </span>
                    {product.discount && (
                      <span className="text-sm line-through text-gray-400">
                        Rs. {product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button className="w-full mt-2 bg-black text-white py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Quick View
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
