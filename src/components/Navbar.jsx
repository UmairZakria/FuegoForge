"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, Heart, ArrowRight, ArrowUpRight, X, Menu } from "lucide-react";
import { useWishlist } from "@/components/WishlistProvider";

const EDITORIAL_NAV = [
  { name: "Home", href: "/" },
  { name: "Collections", href: "/#disciplines" },
  { name: "New Season", href: "/#season" },
  { name: "Archive", href: "/#creations" },
  { name: "Journal", href: "/#journal" },
];

const MOBILE_CATEGORIES = [
  { name: "All Creations", href: "/#creations" },
  { name: "Earrings", href: "/category/earrings" },
  { name: "Necklaces", href: "/category/necklaces" },
  { name: "Hair Accessories", href: "/category/hair-accessories" },
  { name: "Masquerade Masks", href: "/category/masquerade-masks" },
  { name: "Bracelets", href: "/category/bracelets" },
  { name: "Jewelry Boxes", href: "/category/jewelry-boxes" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const rightNavRef = useRef(null);
  const searchInputRef = useRef(null);
  const { items: wishlistItems, setIsOpen: setIsWishlistOpen } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileEmail, setMobileEmail] = useState("");
  const [mobileSubscribed, setMobileSubscribed] = useState(false);
  const [isLogoOnDark, setIsLogoOnDark] = useState(pathname === "/");
  const [isRightNavOnDark, setIsRightNavOnDark] = useState(false);

  // Lock page & Lenis scroll while full-screen mobile menu is open
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.__ffLenis?.stop();

    const handleEsc = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.__ffLenis?.start();
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isMobileMenuOpen]);

  // Focus search input on open & close on Escape / outside click
  useEffect(() => {
    if (!isSearchOpen) return;
    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    const handlePointerDown = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    let rafId = 0;

    const detectContrast = () => {
      rafId = 0;
      const navY = 38;
      const heroPortrait = document.querySelector("[data-hero-portrait]");
      const heroBottomBar = document.querySelector("[data-hero-bottom-bar]");
      const footer = document.querySelector("footer");

      // Check footer overlap (entire footer is dark video)
      if (footer) {
        const fRect = footer.getBoundingClientRect();
        if (navY >= fRect.top && navY <= fRect.bottom) {
          setIsLogoOnDark(true);
          setIsRightNavOnDark(true);
          return;
        }
      }

      // Check hero portrait (left side is dark portrait, right side is warm ivory)
      if (heroPortrait) {
        const pRect = heroPortrait.getBoundingClientRect();
        const bRect = heroBottomBar ? heroBottomBar.getBoundingClientRect() : null;
        const inBottomBar = bRect && navY >= bRect.top && navY <= bRect.bottom;

        if (!inBottomBar && navY >= pRect.top && navY <= pRect.bottom) {
          setIsLogoOnDark(true);
          setIsRightNavOnDark(window.innerWidth < 1024);
          return;
        }
      }

      setIsLogoOnDark(false);
      setIsRightNavOnDark(false);
    };

    const scheduleCheck = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(detectContrast);
      }
    };

    detectContrast();
    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
    };
  }, [pathname]);

  const triggerSearch = (query) => {
    const trimmed = query.trim();
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}#creations`);
    } else {
      router.push("/#creations");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    triggerSearch(searchQuery);
  };

  return (
    <header ref={headerRef} className="fixed top-3 sm:top-4 inset-x-0 z-50 pointer-events-none">
      <div className="layout-shell">
        {/* Floating Translucent Editorial Glass Bar */}
        <div className="pointer-events-auto px-3.5 py-3 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 rounded-[4px]">
          {/* Left: Mobile Menu Toggle + Wordmark */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-1.5 -ml-1 rounded-full transition-all duration-300 active:scale-90 hover:scale-105 cursor-pointer shrink-0 ${
                isLogoOnDark
                  ? "text-white hover:bg-white/10"
                  : "text-black hover:bg-black/5 hover:text-[#9E2A30]"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              <span className="block transition-transform duration-300">
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </span>
            </button>

            <Link ref={logoRef} href="/" className="font-raleway shrink-0">
              <span
                className={`font-cinzel-decorative uppercase tracking-wide text-[15px] sm:text-[clamp(1.15rem,1.3vw,1.55rem)] whitespace-nowrap transition-colors duration-300 ${
                  isLogoOnDark ? "text-white" : "text-black"
                }`}
              >
                Fuego Forge
              </span>
            </Link>
          </div>

          {/* Right: Pipe-Separated Editorial Links + Icons + Dark Chamfered Button */}
          <div ref={rightNavRef} className="flex items-center gap-[clamp(14px,1.8vw,32px)]">
            <nav aria-label="Editorial Navigation" className="hidden lg:flex items-center">
              {EDITORIAL_NAV.map((item, idx) => (
                <div key={item.name} className="flex items-center">
                  {idx > 0 && (
                    <span
                      className={`mx-[clamp(12px,1.2vw,20px)] select-none text-xs transition-colors duration-300 ${
                        isRightNavOnDark ? "text-white/45" : "text-[var(--text-muted)]/60"
                      }`}
                    >
                      |
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className={`text-xs font-poppins tracking-[0.02em] transition-colors duration-300 py-0.5 ${
                      isRightNavOnDark
                        ? "text-white hover:text-[#E0535C]"
                        : "text-[var(--text-primary)] hover:text-[#9E2A30]"
                    } ${
                      item.href === "/" && pathname === "/"
                        ? isRightNavOnDark
                          ? "underline underline-offset-4 decoration-white"
                          : "underline underline-offset-4 decoration-[var(--text-primary)]"
                        : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer ${
                  isSearchOpen
                    ? "bg-[#171515] text-white"
                    : isRightNavOnDark
                      ? "text-white hover:bg-white/10 hover:text-[#E0535C]"
                      : "text-[var(--text-primary)] hover:bg-black/5 hover:text-[#9E2A30]"
                }`}
                aria-label="Search Archive"
                aria-expanded={isSearchOpen}
              >
                <span
                  className={`block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isSearchOpen ? "rotate-90" : "rotate-0"
                  }`}
                >
                  {isSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                </span>
              </button>

              {/* Saved Pieces (Wishlist Drawer Trigger) */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 relative cursor-pointer ${
                  isRightNavOnDark
                    ? "text-white hover:bg-white/10 hover:text-[#E0535C]"
                    : "text-[var(--text-primary)] hover:bg-black/5 hover:text-[#9E2A30]"
                }`}
                aria-label="Open Saved Pieces"
                title="Saved Pieces"
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    wishlistItems.length > 0 ? "fill-[#9E2A30] text-[#9E2A30]" : ""
                  }`}
                />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#9E2A30] text-white text-[9px] font-poppins font-semibold flex items-center justify-center leading-none">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon */}
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 relative ${
                  isRightNavOnDark
                    ? "text-white hover:bg-white/10 hover:text-[#E0535C]"
                    : "text-[var(--text-primary)] hover:bg-black/5 hover:text-[#9E2A30]"
                }`}
                aria-label="Open Etsy Shopping Bag"
                title="Shop Direct on Etsy (50% Off Applied)"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#9E2A30]" />
              </a>

              {/* Signature Dark Chamfered CTA */}
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden sm:inline-flex items-center gap-2 ml-1 px-4 sm:px-5 py-2 bg-[var(--bg-dark)] hover:bg-[#9E2A30] text-[var(--bg-primary)] text-[11px] font-poppins tracking-[0.02em] transition-all duration-300 active:scale-95 whitespace-nowrap"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <span>Shop Boutique</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Minimal Transparent Animated Search Bar */}
        <div
          aria-hidden={!isSearchOpen}
          className={`ml-auto mt-1.5 w-full max-w-sm origin-top-right transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isSearchOpen
              ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 -translate-y-2 scale-95"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={`flex items-center gap-2 p-1.5 pl-4 rounded-full backdrop-blur-md border transition-colors ${
              isRightNavOnDark
                ? "bg-black/35 border-white/25 text-white"
                : "bg-white/30 border-[#171515]/20 text-[#171515]"
            }`}
          >
            <Search
              className={`w-3.5 h-3.5 shrink-0 ${
                isRightNavOnDark ? "text-white/70" : "text-[#171515]/60"
              }`}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces..."
              tabIndex={isSearchOpen ? 0 : -1}
              className={`w-full bg-transparent text-xs font-poppins focus:outline-none ${
                isRightNavOnDark
                  ? "text-white placeholder:text-white/60"
                  : "text-[#171515] placeholder:text-[#171515]/55"
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                tabIndex={isSearchOpen ? 0 : -1}
                className={`p-1 transition-colors cursor-pointer ${
                  isRightNavOnDark
                    ? "text-white/70 hover:text-white"
                    : "text-[#171515]/55 hover:text-[#171515]"
                }`}
                aria-label="Clear search query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="submit"
              tabIndex={isSearchOpen ? 0 : -1}
              className="px-4 py-1.5 rounded-full bg-[#171515] hover:bg-[#9E2A30] text-white text-[11px] font-poppins font-medium transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Full-Screen Lusion-Inspired Mobile Menu (Fuego Forge Theme) */}
        <div
          aria-hidden={!isMobileMenuOpen}
          className={`fixed inset-0 z-[70] lg:hidden bg-[#6E2628] transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-y-auto ${
            isMobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div className="min-h-full flex flex-col justify-between p-4 sm:p-6 gap-3.5">
            {/* Top Bar: Brand Wordmark + Crisp Ivory Circular Close Button */}
            <div className="flex items-center justify-between px-1 pt-1 pb-2">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-cinzel-decorative uppercase tracking-wide text-lg text-[#FAF7F2]"
              >
                Fuego Forge
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
                className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#171515] hover:bg-[#171515] hover:text-white flex items-center justify-center shadow-sm transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stacked Floating Warm-Ivory Cards */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Card 1: Primary Navigation Links */}
              <nav
                aria-label="Mobile Navigation"
                className={`rounded-2xl bg-[#FAF7F2] p-5 sm:p-6 flex flex-col gap-3.5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMobileMenuOpen ? "translate-y-0 opacity-100 delay-75" : "translate-y-4 opacity-0"
                }`}
              >
                {EDITORIAL_NAV.map((item) => {
                  const isActive = item.href === "/" && pathname === "/";
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-1 text-[17px] font-poppins font-medium uppercase tracking-[0.06em] text-[#171515] hover:text-[#9E2A30] transition-colors"
                    >
                      <span>{item.name}</span>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-[#9E2A30] shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Card 2: Atelier Newsletter Dispatch */}
              <div
                className={`rounded-2xl bg-[#FAF7F2] p-5 sm:p-6 space-y-4 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100 delay-150"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <h3 className="font-editorial text-[1.95rem] leading-[1.06] text-[#171515] font-normal">
                  Join the Fuego Forge
                  <br />
                  private atelier
                </h3>

                {mobileSubscribed ? (
                  <p className="text-xs font-poppins text-[#9E2A30] font-medium py-2">
                    Welcome to the Fuego Forge private list.
                  </p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (mobileEmail.trim()) {
                        setMobileSubscribed(true);
                        setMobileEmail("");
                      }
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-[#EFECE6] px-4 py-3 border border-[#171515]/8 focus-within:border-[#6E2628] transition-colors"
                  >
                    <input
                      type="email"
                      required
                      value={mobileEmail}
                      onChange={(e) => setMobileEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 bg-transparent text-sm font-poppins text-[#171515] placeholder:text-[#8E867E] focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe to newsletter"
                      className="p-1 text-[#171515] hover:text-[#9E2A30] transition-colors active:scale-90 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>

              {/* Card 3: Saved Pieces Drawer Trigger */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsWishlistOpen(true);
                }}
                className={`w-full rounded-2xl bg-[#FAF7F2] px-5 sm:px-6 py-4 flex items-center justify-between text-[#171515] hover:text-[#9E2A30] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100 delay-200"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <span className="flex items-center gap-2.5 text-sm font-poppins font-medium uppercase tracking-[0.08em]">
                  <span>Saved Pieces</span>
                  {wishlistItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#9E2A30] text-white text-[10px] font-semibold">
                      {wishlistItems.length}
                    </span>
                  )}
                </span>
                <Heart
                  className={`w-4 h-4 ${
                    wishlistItems.length > 0 ? "fill-[#9E2A30] text-[#9E2A30]" : ""
                  }`}
                />
              </button>

              {/* Card 4: Dark Obsidian Etsy Boutique CTA */}
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full rounded-2xl bg-[#171515] px-5 sm:px-6 py-4 flex items-center justify-between text-[#FAF7F2] hover:bg-[#1F1C1B] transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                  isMobileMenuOpen
                    ? "translate-y-0 opacity-100 delay-300"
                    : "translate-y-4 opacity-0"
                }`}
              >
                <span className="flex items-center gap-3 text-sm font-poppins font-medium uppercase tracking-[0.1em]">
                  <span className="w-2 h-2 rotate-45 bg-[#D9464F] inline-block" />
                  <span>Shop Etsy Boutique</span>
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#FAF7F2]/80" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
