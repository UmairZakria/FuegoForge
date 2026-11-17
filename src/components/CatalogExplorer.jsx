"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Search,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  const activeCategoryName =
    selectedCategory === "all"
      ? "All Creations"
      : categories.find((c) => c.slug === selectedCategory)?.name || "Collection";

  const hasActiveFilters =
    selectedCategory !== "all" || searchQuery.trim() !== "" || sortBy !== "featured";

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <section id="creations" className="layout-shell section-space space-y-[var(--block-gap)]">
      {/* Section Header — Left-Aligned Editorial Split */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-light)] pb-6">
        <div className="space-y-1">
          <span className="text-xs font-poppins text-[#9E2A30] font-medium block">
            Complete Collection
          </span>
          <h2 className="font-editorial type-h1 text-[var(--text-primary)] font-light uppercase leading-[0.98]">
            The Artisan Archive
          </h2>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-poppins text-[var(--text-secondary)] mr-2">
            {filteredProducts.length} of {products.length} Pieces
          </span>

          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[#171515] hover:text-white hover:border-[#171515] text-xs font-poppins font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {isSidebarOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5" />
                <span>Hide Filters</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5" />
                <span>Show Filters</span>
              </>
            )}
          </button>

          {/* Mobile / Tablet Filter Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-poppins font-medium text-[var(--text-primary)] cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter &amp; Sort</span>
          </button>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort products"
            className="px-4 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-poppins font-medium text-[var(--text-primary)] focus:outline-none focus:border-[#171515] cursor-pointer"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Mobile / Tablet Expandable Filter Panel */}
      {isMobileFiltersOpen && (
        <div className="lg:hidden bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-light)] p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces, tags, or materials..."
              className="w-full pl-10 pr-8 py-2.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-primary)] text-sm font-poppins text-[var(--text-primary)] focus:outline-none focus:border-[#171515]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-poppins font-medium border transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#171515] text-white border-[#171515]"
                  : "border-[var(--border-light)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-poppins font-medium border transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-[#171515] text-white border-[#171515]"
                    : "border-[var(--border-light)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Grid: Collapsible Left Sidebar + Fluid Product Grid */}
      <div className={`catalog-workspace ${isSidebarOpen ? "has-sidebar" : ""}`}>
        {/* Desktop Sticky Filter Sidebar */}
        {isSidebarOpen && (
          <aside className="hidden lg:block sticky top-[calc(var(--header-height)+24px)] space-y-6 bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-light)] p-[var(--card-padding)]">
            {/* Search Input */}
            <div className="space-y-2">
              <label
                htmlFor="archive-search"
                className="text-xs font-poppins text-[var(--text-primary)] font-semibold block"
              >
                Search Archive
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="archive-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Keyword, tag, or material..."
                  className="w-full pl-9 pr-8 py-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-primary)] text-xs font-poppins text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#171515]"
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
            </div>

            {/* Category List */}
            <div className="space-y-2.5 border-t border-[var(--border-light)] pt-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-poppins text-[var(--text-primary)] font-semibold">
                  Disciplines
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-poppins text-[#9E2A30] font-medium hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-[8px] text-xs font-poppins transition-colors cursor-pointer text-left ${
                      selectedCategory === "all"
                        ? "bg-[#171515] text-white font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>All Creations</span>
                    <span className="text-[11px] opacity-75">{products.length}</span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 rounded-[8px] text-xs font-poppins transition-colors cursor-pointer text-left ${
                        selectedCategory === cat.slug
                          ? "bg-[#171515] text-white font-medium"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] opacity-75">{cat.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Boutique Note */}
            <div className="border-t border-[var(--border-light)] pt-5 space-y-3">
              <span className="text-xs font-poppins text-[#9E2A30] font-semibold block">
                Official Etsy Boutique
              </span>
              <p className="text-xs font-poppins text-[var(--text-secondary)] leading-relaxed font-light">
                Every creation includes automatic 50% off boutique pricing and free tracked worldwide delivery via Etsy.
              </p>
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-poppins text-[#171515] hover:text-[#9E2A30] font-medium transition-colors"
              >
                <span>Visit Storefront</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        )}

        {/* Right: Fluid Product Grid */}
        <div className="space-y-5 min-w-0">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-light)] text-xs font-poppins">
              <div className="flex flex-wrap items-center gap-2 text-[var(--text-secondary)]">
                <span>Active view:</span>
                <strong className="text-[var(--text-primary)] font-medium">
                  {activeCategoryName}
                </strong>
                {searchQuery.trim() && (
                  <span>
                    • Matching &ldquo;
                    <strong className="text-[var(--text-primary)]">{searchQuery.trim()}</strong>
                    &rdquo;
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[#9E2A30] hover:underline font-medium cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="fluid-product-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-light)] p-12 text-center space-y-4">
              <p className="font-editorial text-2xl text-[var(--text-primary)]">
                No pieces match your current selection
              </p>
              <p className="text-sm font-poppins text-[var(--text-secondary)] font-light">
                Try clearing your search keyword or switching to another discipline.
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
        </div>
      </div>
    </section>
  );
}
