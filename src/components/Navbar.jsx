"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingBag, ExternalLink, X, Menu } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { name: "All Creations", href: "/#creations" },
    { name: "Hair Accessories", href: "/category/hair-accessories" },
    { name: "Earrings", href: "/category/earrings" },
    { name: "Necklaces", href: "/category/necklaces" },
    { name: "Fine Jewelry", href: "/category/fine-jewelry" },
  ];

  return (
    <>
      {/* Top Luxury Announcement Bar */}
      <div className="bg-[#121212] text-[#EFEBE4] py-2 px-4 text-center text-[11px] tracking-luxury uppercase font-sans font-light border-b border-[#252525]">
        <span>Artisan Crafted • 50% Off Limited Flash Sale Exclusively on Etsy • Free Worldwide Delivery</span>
      </div>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EBE5DC] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#121212] hover:text-[#B89758] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Left Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="text-xs uppercase tracking-luxury text-[#121212] hover:text-[#B89758] transition-colors font-medium"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Center Brand Identity (Rouvenat-inspired Serif Monogram) */}
          <div className="text-center">
            <Link href="/" className="inline-block group">
              <span className="block font-brand text-2xl sm:text-3xl tracking-[0.25em] text-[#121212] group-hover:text-[#B89758] transition-colors font-medium uppercase">
                Fuego Forge
              </span>
              <span className="block text-[9px] tracking-luxury uppercase text-[#8E8A83] font-sans -mt-0.5">
                Joaillerie & Artisanat
              </span>
            </Link>
          </div>

          {/* Right Desktop Nav & Actions */}
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8">
              {categories.slice(3).map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="text-xs uppercase tracking-luxury text-[#121212] hover:text-[#B89758] transition-colors font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Official Etsy Store Link */}
            <a
              href="https://fuegoforge.etsy.com?ref=share_and_save"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-sans tracking-luxury uppercase border border-[#121212] hover:bg-[#121212] hover:text-[#FAF8F5] transition-all rounded-none"
            >
              <span>Etsy Boutique</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EBE5DC] bg-[#FAF8F5] px-6 py-6 space-y-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm uppercase tracking-luxury text-[#121212] hover:text-[#B89758] py-1 font-medium"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#EBE5DC]">
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#121212] text-[#FAF8F5] text-xs uppercase tracking-luxury font-medium"
              >
                <span>Visit Official Etsy Boutique</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
