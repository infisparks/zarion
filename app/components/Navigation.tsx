"use client";

import { useState, useEffect } from "react";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`hidden md:block fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className={`text-2xl font-bold ${isScrolled ? "text-black" : "text-white"}`}>
               ZARION
              </Link>
              <div className="flex items-center gap-8">
                {[
                  { name: "Home", path: "/" },
                  { name: "Shop", path: "/shop" },
                  { name: "Men", path: "/men" },
                  { name: "Women", path: "/women" }
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`${
                      isScrolled ? "text-gray-800" : "text-white"
                    } hover:opacity-70 transition ${
                      pathname === item.path ? "font-semibold" : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <button className={`${isScrolled ? "text-gray-800" : "text-white"}`}>
                <Search className="w-5 h-5" />
              </button>
              <Link href="/profile" className={`${isScrolled ? "text-gray-800" : "text-white"}`}>
                <User className="w-5 h-5" />
              </Link>
              <div className="relative">
                <Link href="/cart" className={`${isScrolled ? "text-gray-800" : "text-white"}`}>
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className={`flex flex-col items-center ${pathname === "/" ? "text-black" : "text-gray-500"}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/search" className={`flex flex-col items-center ${pathname === "/search" ? "text-black" : "text-gray-500"}`}>
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link href="/cart" className={`flex flex-col items-center ${pathname === "/cart" ? "text-black" : "text-gray-500"}`}>
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <span className="text-xs mt-1">Cart</span>
          </Link>
          <Link href="/profile" className={`flex flex-col items-center ${pathname === "/profile" ? "text-black" : "text-gray-500"}`}>
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-center h-16">
          <Link href="/" className="text-2xl font-bold">
            ZARION
          </Link>
        </div>
      </div>
    </>
  );
}