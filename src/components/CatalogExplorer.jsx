"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";

function CategoryShelf({ group }) {
  const trackRef = useRef(null);

  const scrollTrack = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.78, 300);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="space-y-3 md:space-y-5">
      {/* Category Shelf Header */}
      <div className="flex items-center justify-between gap-3 md:border-b md:border-[var(--border-light)] md:pb-3">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h3 className="font-editorial text-2xl md:text-[clamp(1.65rem,2.2vw,2.35rem)] font-normal uppercase tracking-[-0.01em] text-[#171515] truncate">
            {group.name}
          </h3>
          <span className="text-[11px] md:text-xs font-poppins text-[var(--text-muted)] shrink-0">
            ({group.items.length})
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {group.items.length > 4 && (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollTrack(-1)}
                aria-label={`Previous ${group.name}`}
                className="w-8 h-8 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[#171515] hover:text-white hover:border-[#171515] text-[#171515] flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => scrollTrack(1)}
                aria-label={`Next ${group.name}`}
                className="w-8 h-8 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[#171515] hover:text-white hover:border-[#171515] text-[#171515] flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Link
            href={`/category/${group.slug}`}
            className="inline-flex items-center gap-0.5 text-xs font-poppins font-medium text-[#9E2A30] hover:text-[#171515] transition-colors shrink-0"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal Swipeable Track (2 cards mobile / 3 tablet / exact 4-col card width desktop) */}
      <div
        ref={trackRef}
        className="-mx-[var(--page-gutter)] px-[var(--page-gutter)] md:mx-0 md:px-0 flex gap-3 md:gap-[var(--grid-gap)] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {group.items.map((product) => (
          <div
            key={product.id}
            className="shrink-0 w-[46%] sm:w-[34%] md:w-[calc((100%-2*var(--grid-gap))/3)] lg:w-[calc((100%-3*var(--grid-gap))/4)] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CatalogExplorer({ products, categories }) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  return (
    <CatalogExplorerInner
      key={urlQuery}
      products={products}
      categories={categories}
      initialQuery={urlQuery}
    />
  );
}

function CatalogExplorerInner({ products, categories, initialQuery }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = products.filter((p) => {
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;

      return (
        p.title.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q)) ||
        (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });

    if (sortBy === "price-asc") {
      return [...list].sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === "price-desc") {
      return [...list].sort((a, b) => Number(b.price) - Number(a.price));
    }
    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const showCategorySections =
    selectedCategory === "all" && searchQuery.trim() === "";

  const groupedByCategory = useMemo(() => {
    if (!showCategorySections) return [];
    return categories
      .map((cat) => ({
        ...cat,
        items: filteredProducts.filter((p) => p.category === cat.slug),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, filteredProducts, showCategorySections]);

  const hasActiveFilters =
    selectedCategory !== "all" || searchQuery.trim() !== "" || sortBy !== "featured";

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <section id="creations" className="layout-shell section-space space-y-[clamp(24px,2.4vw,40px)]">
      {/* Section Header: Title + Inline Search & Sort + Category Tabs */}
      <div className="space-y-5 border-b border-[var(--border-light)] pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-poppins text-[#9E2A30] font-medium block">
              Complete Collection
            </span>
            <h2 className="font-editorial type-h1 text-[var(--text-primary)] font-light uppercase leading-[0.98]">
              The Artisan Archive
            </h2>
          </div>

          {/* Right Header Controls: Search Input + Sort + Piece Count */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Inline Search Input */}
            <div className="relative flex-1 sm:flex-initial sm:w-64 md:w-72">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces, tags, materials..."
                aria-label="Search archive"
                className="w-full pl-9 pr-8 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-poppins text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#171515] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="appearance-none pl-4 pr-9 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-poppins font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#171515] cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Tabs Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-poppins font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === "all"
                  ? "bg-[#171515] text-white border-[#171515]"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[#171515] hover:text-[#171515]"
              }`}
            >
              All Creations ({products.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-poppins font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  selectedCategory === cat.slug
                    ? "bg-[#171515] text-white border-[#171515]"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-light)] hover:border-[#171515] hover:text-[#171515]"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-poppins font-medium text-[#9E2A30] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Products: Categorized Horizontal Swipe Shelves (All View) or Full Grid (Filtered/Search) */}
      {filteredProducts.length > 0 ? (
        showCategorySections ? (
          <div className="space-y-10 md:space-y-14">
            {groupedByCategory.map((group) => (
              <CategoryShelf key={group.slug} group={group} />
            ))}
          </div>
        ) : (
          <div className="fluid-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )
      ) : (
        <div className="bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-light)] p-12 text-center space-y-4">
          <p className="font-editorial text-2xl text-[var(--text-primary)]">
            No pieces match your current selection
          </p>
          <p className="text-sm font-poppins text-[var(--text-secondary)] font-light">
            Try clearing your search keyword or switching to another category tab.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-full bg-[#171515] hover:bg-[#9E2A30] text-white text-xs font-poppins font-medium transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
