"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Heart, ShoppingBag, Star } from "lucide-react"
import { database } from "../lib/firebaseconfig"
import { ref as dbRef, onValue } from "firebase/database"
// import Navigation from "./navigation"

interface Product {
  id?: string
  productName: string
  category: string
  price: number
  discount?: number
  stock: number
  sku?: string
  description: string
  imageUrls: string[]
  sizes?: string[]
  createdAt: number
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All Mens Wear")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* <Navigation /> */}

      {/* Main Content with proper spacing for navigation */}
      <div className="pt-20 md:pt-20 pb-20 md:pb-0">
        {/* Search Section for Mobile */}
        <div className="md:hidden px-4 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
              <Filter className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        {/* Desktop Search Section */}
        <div className="hidden md:block bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Premium Collection</h1>
                <p className="text-sm text-slate-500">Discover our latest arrivals</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
                  <Filter className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <CategoriesNavigation selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        <ProductsSection selectedCategory={selectedCategory} searchQuery={searchQuery} />
      </div>
    </div>
  )
}

interface CategoriesNavigationProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
}

const CategoriesNavigation = ({ selectedCategory, setSelectedCategory }: CategoriesNavigationProps) => {
  const categories = [
    { title: "All Mens Wear", icon: "🛍️", color: "from-blue-500 to-purple-600" },
    { title: "T-shirt", icon: "👕", color: "from-green-500 to-teal-600" },
    { title: "Shirt", icon: "👔", color: "from-orange-500 to-red-600" },
    { title: "Udy", icon: "🧥", color: "from-purple-500 to-pink-600" },
    { title: "Pent", icon: "👖", color: "from-indigo-500 to-blue-600" },
    { title: "Trouser", icon: "👖", color: "from-gray-500 to-slate-600" },
  ]

  return (
    <nav className="sticky top-16 md:top-20 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 z-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex overflow-x-auto scrollbar-hide gap-3 lg:gap-4 lg:justify-center">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.title)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 lg:gap-2 p-3 lg:p-4 rounded-2xl transition-all duration-300 ${
                selectedCategory === category.title
                  ? "bg-slate-900 text-white shadow-lg scale-105"
                  : "bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm border border-slate-200"
              }`}
            >
              <div
                className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center text-sm lg:text-base ${
                  selectedCategory === category.title ? "bg-white/20" : `bg-gradient-to-br ${category.color}`
                }`}
              >
                {selectedCategory === category.title ? "✓" : category.icon}
              </div>
              <span className="text-xs lg:text-sm font-medium whitespace-nowrap">{category.title}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

interface ProductsSectionProps {
  selectedCategory: string
  searchQuery: string
}

const ProductsSection = ({ selectedCategory, searchQuery }: ProductsSectionProps) => {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const productsRef = dbRef(database, "products")
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const productArray: Product[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }))
        setProducts(productArray)
      } else {
        setProducts([])
      }
    })
    return () => unsubscribe()
  }, [])

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All Mens Wear" || product.category === selectedCategory
    const matchesSearch = product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getDiscountPercentage = (price: number, discount?: number): number => {
    if (discount === undefined || price === 0) return 0
    return Math.round(((price - discount) / price) * 100)
  }

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="text-xl lg:text-3xl font-bold text-slate-900">New Arrivals</h2>
          <p className="text-xs lg:text-sm text-slate-500 mt-0.5 lg:mt-1">
            {filteredProducts.length} items found • Premium quality guaranteed
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
            <span className="text-xs lg:text-sm text-slate-600">4.8 Rating</span>
          </div>
          <select className="text-xs lg:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </div>
      </div>

      {/* Products Grid - Fixed spacing and removed empty space */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {filteredProducts.map((product, index) => (
          <Link key={product.id} href={`/cart/${product.id}`}>
            <div className="group bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/50">
              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                <img
                  src={product.imageUrls?.[0] || "https://via.placeholder.com/300"}
                  alt={product.productName}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Discount Badge */}
                {product.discount && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-full">
                    <span className="text-xs lg:text-sm font-bold">
                      -{getDiscountPercentage(product.price, product.discount)}%
                    </span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                    <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600" />
                  </button>
                </div>

                {/* Quick View Button */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <button className="w-full bg-slate-900/90 backdrop-blur-sm text-white py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-medium hover:bg-slate-900 transition-colors">
                    Quick View
                  </button>
                </div>
              </div>

              {/* Product Info - Removed flex-grow and unnecessary spacing */}
              <div className="p-3 lg:p-4">
                <h3 className="font-semibold text-slate-900 text-sm lg:text-base line-clamp-2 mb-2 leading-tight">
                  {product.productName}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 lg:w-3.5 lg:h-3.5 ${i < 4 ? "text-yellow-400 fill-current" : "text-slate-200"}`}
                    />
                  ))}
                  <span className="text-xs lg:text-sm text-slate-500 ml-1">(4.2)</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base lg:text-lg font-bold text-slate-900">
                    ₹{product.discount ? product.discount.toFixed(0) : product.price.toFixed(0)}
                  </span>
                  {product.discount && (
                    <span className="text-sm lg:text-base line-through text-slate-400">
                      ₹{product.price.toFixed(0)}
                    </span>
                  )}
                </div>

                {/* Stock Status & Add to Cart - Removed mt-auto */}
                <div className="flex items-center justify-between">
                  <div
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs lg:text-sm font-medium ${
                      product.stock > 10
                        ? "bg-green-100 text-green-700"
                        : product.stock > 0
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                  </div>
                  <button className="p-1.5 lg:p-2 rounded-full bg-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-300">
                    <ShoppingBag className="w-3 h-3 lg:w-4 lg:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center mt-8 lg:mt-12">
          <button className="px-8 lg:px-12 py-3 lg:py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl text-sm lg:text-base font-medium hover:from-slate-800 hover:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            Load More Products
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 lg:py-20">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 lg:w-8 lg:h-8 text-slate-400" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-2">No products found</h3>
          <p className="text-sm lg:text-base text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </section>
  )
}
