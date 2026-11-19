"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, Trash2, Heart, ArrowRight, ExternalLink } from "lucide-react";

const STORAGE_KEY = "ff_wishlist_v1";
const WishlistContext = createContext(null);

function getThumbUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.replace("/il_fullxfull.", "/il_600xN.").replace("/il_800x800.", "/il_600xN.");
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // Ignore storage errors
    }
    setHydrated(true);
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items, hydrated]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const isWishlisted = useCallback(
    (id) => items.some((item) => item.id === id),
    [items]
  );

  const toggleItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [
        {
          id: product.id,
          slug: product.slug,
          title: product.title,
          categoryName: product.categoryName,
          price: product.price,
          originalPrice: product.originalPrice,
          mainImage: product.mainImage,
          etsyUrl: product.etsyUrl,
        },
        ...prev,
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const totalValue = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <WishlistContext.Provider
      value={{ items, isOpen, setIsOpen, isWishlisted, toggleItem, removeItem, clearAll }}
    >
      {children}

      {/* Slide-Over Saved Pieces Drawer (Smooth Open & Close Animation) */}
      <div
        className={`fixed inset-0 z-[80] flex justify-end transition-visibility duration-300 ${
          isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
        aria-label="Saved Pieces"
      >
        {/* Backdrop Scrim */}
        <div
          onClick={() => setIsOpen(false)}
          className={`fixed inset-0 bg-[#171515]/50 backdrop-blur-xs transition-opacity duration-350 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer Panel */}
        <aside
          className={`relative z-10 w-full max-w-md h-full bg-[#FAF7F2] text-[#171515] border-l border-[var(--border-light)] shadow-2xl flex flex-col transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[var(--border-light)] flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-editorial text-2xl font-light text-[#171515]">
                  Saved Pieces
                </h2>
                <span className="text-xs font-poppins text-[var(--text-muted)]">
                  ({items.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-poppins text-[#9E2A30] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Saved Pieces"
                  className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[#171515] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[#9E2A30]">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-editorial text-2xl text-[#171515]">
                      Your archive is empty
                    </p>
                    <p className="text-xs font-poppins text-[var(--text-secondary)] font-light max-w-xs">
                      Tap the heart on any piece while browsing to save it here for quick access.
                    </p>
                  </div>
                  <Link
                    href="/#creations"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171515] hover:bg-[#9E2A30] text-white text-xs font-poppins font-medium transition-colors"
                  >
                    <span>Explore Creations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-[var(--border-light)] last:border-b-0"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="w-20 h-24 rounded-[8px] overflow-hidden bg-[var(--bg-secondary)] shrink-0"
                    >
                      {item.mainImage && (
                        <img
                          src={getThumbUrl(item.mainImage)}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-poppins text-[#9E2A30] font-medium block">
                            {item.categoryName}
                          </span>
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="font-title font-medium text-sm text-[#171515] hover:text-[#9E2A30] line-clamp-2 leading-snug transition-colors"
                          >
                            {item.title}
                          </Link>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="p-1 text-[var(--text-muted)] hover:text-[#9E2A30] transition-colors shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-poppins font-semibold text-sm text-[#171515]">
                            ${Number(item.price).toFixed(2)}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="font-poppins text-[11px] text-[var(--text-muted)] line-through font-light">
                              ${Number(item.originalPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {item.etsyUrl && (
                          <a
                            href={item.etsyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F1641E] hover:bg-[#D75413] text-white text-[11px] font-poppins font-medium transition-colors"
                          >
                            <span>Buy on Etsy</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[var(--border-light)] bg-[#F2EDE5] space-y-3">
                <div className="flex items-baseline justify-between text-sm font-poppins">
                  <span className="text-[var(--text-secondary)]">Estimated Total</span>
                  <span className="font-semibold text-base text-[#171515]">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
                <a
                  href="https://fuegoforge.etsy.com?ref=share_and_save"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-full bg-[#171515] hover:bg-[#9E2A30] text-white flex items-center justify-center gap-2 text-xs font-poppins font-medium transition-colors"
                >
                  <span>Visit Official Etsy Boutique</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </aside>
      </div>
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    return {
      items: [],
      isOpen: false,
      setIsOpen: () => {},
      isWishlisted: () => false,
      toggleItem: () => {},
      removeItem: () => {},
      clearAll: () => {},
    };
  }
  return ctx;
}

