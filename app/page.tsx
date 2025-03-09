"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { database } from "../lib/firebaseconfig";
import { ref as dbRef, onValue } from "firebase/database";

interface Product {
  id?: string;         // Firebase key
  productName: string;
  category: string;
  price: number;
  discount?: number;   // Discounted price that the user pays
  stock: number;
  sku?: string;
  description: string;
  imageUrls: string[];
  sizes?: string[];
  createdAt: number;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <CategoriesSlider />
      <ProductsSection />
    </main>
  );
}

const CategoriesSlider = () => {
  const categories = [
    { title: "Women's", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071" },
    { title: "Men's", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1964" },
    { title: "Accessories", image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965" },
    { title: "Sale", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=2071" },
  ];

  const sliderRef = useRef<HTMLDivElement>(null);
  const [cardsPerPage, setCardsPerPage] = useState<number>(2);
  const [activePage, setActivePage] = useState<number>(0);

  useEffect(() => {
    const updateCardsPerPage = () => {
      if (window.innerWidth >= 768) {
        setCardsPerPage(4);
      } else {
        setCardsPerPage(2);
      }
    };
    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const totalPages = Math.ceil(categories.length / cardsPerPage);

  const scrollToPage = (pageIndex: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: pageIndex * sliderRef.current.clientWidth, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const handleScroll = () => {
      const page = Math.round(slider.scrollLeft / slider.clientWidth);
      setActivePage(page);
    };
    slider.addEventListener("scroll", handleScroll);
    return () => slider.removeEventListener("scroll", handleScroll);
  }, [cardsPerPage]);

  return (
    <section className="py-4 bg-gray-100 relative md:mt-20">
      <div className="container mx-auto px-4">
        <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          <div ref={sliderRef} className="flex space-x-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="snap-start flex-shrink-0 w-1/2 md:w-1/4 text-center"
              >
                <div className="p-4 bg-white rounded-xl shadow">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-24 object-cover rounded-full"
                  />
                  <p className="mt-2 text-sm font-medium">{category.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Dot Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToPage(index)}
              className={`w-3 h-3 rounded-full ${activePage === index ? "bg-blue-500" : "bg-gray-300"}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductsSection = () => {
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

  const getDiscountPercentage = (price: number, discount?: number): number => {
    if (discount === undefined || price === 0) return 0;
    return Math.round(((price - discount) / price) * 100);
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Latest Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <p>Loading products...</p>
          ) : (
            products.map((product) => (
              <Link key={product.id} href={`/cart/${product.id}`}>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="relative aspect-[3/4]">
                    <img
                      src={product.imageUrls?.[0] || "https://via.placeholder.com/300"}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{product.productName}</h3>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold">
                        Rs. {product.discount ? product.discount.toFixed(2) : product.price.toFixed(2)}
                      </span>
                      {product.discount && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-gray-500">
                            Rs. {product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-green-600">
                            {getDiscountPercentage(product.price, product.discount)}% off
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
