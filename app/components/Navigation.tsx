"use client"

import { useState, useEffect } from "react"
import { Home, Search, ShoppingCart, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // For desktop navigation:
  // - On the home page: text is white (or gray for links) until you scroll, then turns black.
  // - On all other routes: text is always black.
  const desktopTextClass = () => {
    if (!isHome) return "text-black"
    return isScrolled ? "text-black" : "text-black"
  }

  const desktopLinkClass = (linkPath: string) => {
    const baseClass = !isHome ? "text-black" : isScrolled ? "text-gray-800" : "text-black"
    return `${baseClass} hover:opacity-70 transition ${pathname === linkPath ? "font-semibold" : ""}`
  }

  // For mobile bottom navigation:
  // - On the home page, the active link is black while inactive ones are gray.
  // - On all other routes, all nav link texts are always black.
  const mobileLinkClass = (linkPath: string) => {
    if (!isHome) return "text-black"
    return pathname === linkPath ? "text-black" : "text-gray-500"
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`hidden md:block fixed w-full z-50 transition-all duration-300 ${
          isHome
            ? isScrolled
              ? "bg-white/80 backdrop-blur-lg shadow-md"
              : "bg-transparent"
            : "bg-white/80 backdrop-blur-lg shadow-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-12">
              <Link href="/" className={`text-2xl font-bold ${desktopTextClass()}`}>
                ZARION
              </Link>
              <div className="flex items-center gap-8">
                {[
                  { name: "Home", path: "/" },
                  { name: "Shop", path: "/shop" },
                  { name: "Cart", path: "/cart" },
                  { name: "Profile", path: "/profile" },
                ].map((item) => (
                  <Link key={item.name} href={item.path} className={desktopLinkClass(item.path)}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className={desktopTextClass()}>
                <Search className="w-5 h-5" />
              </button>
              <Link href="/profile" className={desktopTextClass()}>
                <User className="w-5 h-5" />
              </Link>
              <div className="relative">
                <Link href="/cart" className={desktopTextClass()}>
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
          <Link href="/" className={`flex flex-col items-center ${mobileLinkClass("/")}`}>
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/shop" className={`flex flex-col items-center ${mobileLinkClass("/shop")}`}>
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          <Link href="/cart" className={`flex flex-col items-center ${mobileLinkClass("/cart")}`}>
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </div>
            <span className="text-xs mt-1">Cart</span>
          </Link>
          <Link href="/profile" className={`flex flex-col items-center ${mobileLinkClass("/profile")}`}>
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Mobile Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-center h-16">
          <Link href="/" className="text-2xl font-bold text-black">
            ZARION
          </Link>
        </div>
      </div>
    </>
  )
}
