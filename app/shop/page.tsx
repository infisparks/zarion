"use client";

import { useState } from "react";
import { ShoppingBag, Star, Heart, Search, Filter, ChevronDown } from "lucide-react";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "all", name: "All Products" },
    { id: "new", name: "New Arrivals" },
    { id: "dresses", name: "Dresses" },
    { id: "tops", name: "Tops" },
    { id: "outerwear", name: "Outerwear" },
    { id: "accessories", name: "Accessories" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070')"
          }}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Our Collection</h1>
            <p className="text-lg text-white/90">Discover our curated selection of premium fashion</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Mobile Filter Toggle */}
        <button 
          className="md:hidden w-full bg-white/80 backdrop-blur-md shadow-sm rounded-lg px-4 py-3 mb-6 flex items-center justify-between"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`md:w-64 space-y-8 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedCategory === category.id 
                        ? "bg-black text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Price Range</h3>
              <div className="space-y-4">
                <input 
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  className="w-full"
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                />
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <button 
                    key={size}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-100 transition"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-bold">All Products</h2>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white/80 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <select className="px-4 py-2 rounded-lg border bg-white/80 backdrop-blur-md">
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(null).map((_, index) => (
                <div 
                  key={index}
                  className="group bg-white/80 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${[
                        "1434389677669-e08b4cac3105",
                        "1539533018447-63fcce2678e3",
                        "1521223890158-f9f7c3d5d504",
                        "1576566588028-4147f3842f27",
                        "1487412720507-e7ab37603c6f",
                        "1488161628813-04466f872be2",
                        "1492707892479-7bc8d5a4ee93",
                        "1434389677669-e08b4cac3105",
                        "1539533018447-63fcce2678e3"
                      ][index]}?q=80&w=1974`}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
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
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">Premium Fashion Item</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">$199.99</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <button className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-black/90 transition">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}