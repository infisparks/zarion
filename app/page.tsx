"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ChevronRight, 
  Star, 
  Truck, 
  RefreshCw, 
  Shield, 
  Search, 
  Menu, 
  X, 
  Heart, 
  User, 
  ShoppingCart 
} from "lucide-react";
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
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "shop":
        return <ShopContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navbar (if needed) */}
      {renderContent()}
    </main>
  );
}

const HomeContent = () => {
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
    <div>
      {/* Hero Section with Scrollable Product Carousel */}
      <section className="relative h-screen flex flex-col justify-center md:justify-end pb-20">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070')",
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
          </div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          {/* Uncomment below for hero text if desired */}
          {/*
          <div className="max-w-2xl text-white">
            <h1 className="text-7xl font-bold mb-6">Autumn Collection 2024</h1>
            <p className="text-xl mb-8">
              Discover our curated selection of premium clothing that defines modern elegance and sustainable fashion.
            </p>
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition flex items-center gap-2">
              Explore Collection <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          */}
        </div>
        <div className="container mx-auto px-4 mt-8 relative z-10">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {products.length === 0 ? (
              <p className="text-white">Loading products...</p>
            ) : (
              products.map((product) => (
                <Link key={product.id} href={`/cart/${product.id}`}>
                  <div className="min-w-[250px] bg-white/80 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : "https://via.placeholder.com/300"} 
                        alt={product.productName} 
                        className="w-full h-full object-contain object-center transition-transform group-hover:scale-105 duration-500"
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

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Women's Collection",
                image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2071",
                description: "Elegant & Timeless"
              },
              {
                title: "Men's Collection",
                image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1964",
                description: "Modern & Sophisticated"
              },
              {
                title: "Accessories",
                image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965",
                description: "Complete Your Look"
              }
            ].map((category, index) => (
              <div 
                key={index} 
                className="group cursor-pointer relative overflow-hidden rounded-lg aspect-[3/4]"
              >
                <img 
                  src={category.image} 
                  alt={category.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-lg mb-4">{category.description}</p>
                  <button className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/40 hover:bg-white/30 transition">
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">New Arrivals</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Discover our latest collection of premium clothing and accessories.
          </p>
          {/* Updated grid to show 2 columns on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {products.length === 0 ? (
              <p className="text-center">Loading products...</p>
            ) : (
              products.map((product) => (
                <Link key={product.id} href={`/cart/${product.id}`}>
                  <div className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img 
                        src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : "https://via.placeholder.com/300"} 
                        alt={product.productName}
                        className="w-full aspect-[3/4] object-contain object-center transform group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-4 left-4 right-4">
                          <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <ShoppingBag className="w-5 h-5" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
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
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over Rs.200" },
              { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
              { icon: Shield, title: "Secure Shopping", desc: "100% secure checkout" },
              { icon: Heart, title: "Loyalty Rewards", desc: "Earn points on purchases" }
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6">
                <feature.icon className="w-12 h-12 text-gray-800 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Subscribe to receive exclusive offers, early access to new collections, and style inspiration delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <input 
              type="email" 
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopContent = () => {
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
    <div className="pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              {["All", "New Arrivals", "Best Sellers", "Dresses", "Tops", "Outerwear", "Accessories"].map((category) => (
                <div key={category} className="flex items-center mb-2">
                  <input type="checkbox" className="mr-2" />
                  <span>{category}</span>
                </div>
              ))}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <input type="range" className="w-full" />
              <div className="flex justify-between mt-2">
                <span>Rs.0</span>
                <span>Rs.500</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button key={size} className="border rounded-md py-1 hover:bg-gray-100">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Products</h2>
              <select className="border rounded-lg px-4 py-2">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.length === 0 ? (
                <p className="text-center">Loading products...</p>
              ) : (
                products.map((product) => (
                  <Link key={product.id} href={`/cart/${product.id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img 
                          src={product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : "https://via.placeholder.com/300"} 
                          alt={product.productName}
                          className="w-full aspect-[3/4] object-contain object-center transform group-hover:scale-105 transition duration-500"
                        />
                        <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Heart className="w-5 h-5" />
                        </button>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-4 left-4 right-4">
                            <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                              <ShoppingBag className="w-5 h-5" /> Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
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
                  </Link>
                ))
              )}
            </div>

            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
