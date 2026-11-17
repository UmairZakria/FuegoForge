"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, ArrowRight, X, Menu } from "lucide-react";

const EDITORIAL_NAV = [
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogoOnDark, setIsLogoOnDark] = useState(pathname === "/");
  const [isRightNavOnDark, setIsRightNavOnDark] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const parseRgba = (colorStr) => {
      if (!colorStr || colorStr === "transparent") return null;
      const m = colorStr.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)/i);
      if (!m) return null;
      const r = Number(m[1]);
      const g = Number(m[2]);
      const b = Number(m[3]);
      const a = m[4] !== undefined ? Number(m[4]) : 1;
      if (a < 0.2) return null;
      return { r, g, b, a };
    };

    const isPointOnDark = (cx, cy) => {
      const heroPortrait = document.querySelector("[data-hero-portrait]");
      const heroBottomBar = document.querySelector("[data-hero-bottom-bar]");
      if (heroPortrait) {
        const pRect = heroPortrait.getBoundingClientRect();
        const bRect = heroBottomBar ? heroBottomBar.getBoundingClientRect() : null;
        const coveredByBottomBar =
          bRect && cy >= bRect.top && cy <= bRect.bottom && cx >= bRect.left && cx <= bRect.right;

        if (!coveredByBottomBar && cy >= pRect.top && cy <= pRect.bottom) {
          const isDesktop = window.innerWidth >= 1024;
          const darkPortraitRightEdge = isDesktop
            ? pRect.left + pRect.width * 0.45
            : pRect.right;
          return cx <= darkPortraitRightEdge;
        }
      }

      const elements = document.elementsFromPoint(cx, cy);
      for (const el of elements) {
        if (headerRef.current && headerRef.current.contains(el)) continue;

        if (el.tagName === "VIDEO") return true;

        if (el.tagName === "IMG") {
          if (heroPortrait && heroPortrait.contains(el)) continue;
          return true;
        }

        const style = window.getComputedStyle(el);
        const bg = parseRgba(style.backgroundColor);
        if (bg) {
          const luminance = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b;
          return luminance < 140;
        }
      }

      return false;
    };

    const detectContrast = () => {
      rafId = 0;
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        setIsLogoOnDark(isPointOnDark(rect.left + rect.width / 2, rect.top + rect.height / 2));
      }
      if (rightNavRef.current) {
        const rect = rightNavRef.current.getBoundingClientRect();
        setIsRightNavOnDark(isPointOnDark(rect.left + rect.width / 3, rect.top + rect.height / 2));
      }
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}#creations`);
    } else {
      router.push("/#creations");
    }
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
              className={`lg:hidden p-1.5 -ml-1 hover:text-[#9E2A30] transition-colors duration-300 cursor-pointer shrink-0 ${
                isLogoOnDark ? "text-white" : "text-black"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
                      idx === 0
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

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 transition-colors duration-300 cursor-pointer ${
                  isRightNavOnDark
                    ? "text-white hover:text-[#E0535C]"
                    : "text-[var(--text-primary)] hover:text-[#9E2A30]"
                }`}
                aria-label="Search Archive"
              >
                {isSearchOpen ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
              </button>

              {/* Shopping Bag Icon */}
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 transition-colors duration-300 relative ${
                  isRightNavOnDark
                    ? "text-white hover:text-[#E0535C]"
                    : "text-[var(--text-primary)] hover:text-[#9E2A30]"
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
                className="hidden sm:inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-[var(--bg-dark)] hover:bg-[#9E2A30] text-[var(--bg-primary)] text-[11px] font-poppins tracking-[0.02em] transition-all duration-300 whitespace-nowrap"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                <span>Shop Boutique</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {isSearchOpen && (
          <div className="pointer-events-auto mt-2 rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)]/95 backdrop-blur-xl shadow-lg">
            <form onSubmit={handleSearchSubmit} className="px-5 py-3 flex items-center gap-3">
              <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handcrafted earrings, necklaces, vintage hairpins, rings..."
                autoFocus
                className="w-full bg-transparent text-[length:var(--text-body)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[var(--bg-dark)] text-[var(--bg-primary)] hover:bg-[#9E2A30] text-xs font-poppins font-medium transition-colors shrink-0 cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Editorial Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto lg:hidden mt-2 rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)]/95 backdrop-blur-xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-wrap gap-4 pb-3 border-b border-[var(--border-light)]">
              {EDITORIAL_NAV.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-poppins font-medium text-[#9E2A30]"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MOBILE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-poppins font-medium text-[var(--text-primary)] hover:text-[#9E2A30] py-2.5 px-3.5 rounded-[8px] border border-[var(--border-light)] bg-[var(--bg-primary)] transition-colors"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
