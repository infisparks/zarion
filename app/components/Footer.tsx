import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-6">LUXE</h3>
            <p className="text-gray-400 mb-6">
              Premium fashion destination offering curated collections of modern and timeless pieces.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-300 transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-gray-300 transition">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {["Home", "Shop", "About Us", "Contact", "FAQs"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Customer Service</h4>
            <ul className="space-y-4">
              {[
                "Shipping Information",
                "Returns & Exchanges",
                "Size Guide",
                "Track Order",
                "Gift Cards"
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                123 Fashion Street, NY 10001
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5" />
                +1 (234) 567-8900
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5" />
                contact@luxe.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2024 LUXE. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}