"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ChevronRight, Star, Truck, RefreshCw, Shield, Search, Menu, X, Heart, User, ShoppingCart } from "lucide-react";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case "shop":
        return <ShopContent />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <main className="min-h-screen">
      {/* Navbar */}
     

      {renderContent()}
    </main>
  );
}

const HomeContent = () => (
  <>
    {/* Hero Section */}
    <section className="relative h-screen flex items-center">
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
        <div className="max-w-2xl text-white">
          <h1 className="text-7xl font-bold mb-6">Autumn Collection 2024</h1>
          <p className="text-xl mb-8">Discover our curated selection of premium clothing that defines modern elegance and sustainable fashion.</p>
          <button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition flex items-center gap-2">
            Explore Collection <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>

    {/* Categories */}
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
              title: "Accessoriess",
              image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1965",
              description: "Complete Your Look"
            }
          ].map((category, index) => (
            <div key={index} className="group cursor-pointer relative overflow-hidden rounded-lg aspect-[3/4]">
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

    {/* Featured Products */}
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">New Arrivals</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Discover our latest collection of premium clothing and accessories, crafted with attention to detail and sustainable materials.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              name: "Wool Blend Coat",
              price: "$289.99",
              image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=1974",
              rating: 4.8,
              tag: "Best Seller"
            },
            {
              name: "Silk Blouse",
              price: "$129.99",
              image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005",
              rating: 4.9,
              tag: "New"
            },
            {
              name: "Leather Jacket",
              price: "$349.99",
              image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=1992",
              rating: 4.7,
              tag: "Limited"
            },
            {
              name: "Cashmere Sweater",
              price: "$199.99",
              image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964",
              rating: 4.9,
              tag: "Trending"
            }
          ].map((product, index) => (
            <div key={index} className="group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full aspect-[3/4] object-cover transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {product.tag}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <button className="w-full bg-white/90 backdrop-blur-sm text-black py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{product.price}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over $200" },
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

    {/* Newsletter */}
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
  </>
);

const ShopContent = () => (
  <div className="pt-20">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
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
              <span>$0</span>
              <span>$500</span>
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

        {/* Products Grid */}
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
            {Array(9).fill(null).map((_, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-lg mb-4">
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
                    className="w-full aspect-[3/4] object-cover transform group-hover:scale-105 transition duration-500"
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
                <h3 className="font-semibold text-lg mb-2">Product Name</h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">$199.99</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 border-2 border-black rounded-lg font-semibold hover:bg-black hover:text-white transition">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);