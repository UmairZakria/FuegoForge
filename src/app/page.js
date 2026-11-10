import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { Sparkles, ShieldCheck, Truck, RefreshCw, Star, ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "FUEGO FORGE | Contemporary Handcrafted Fine Jewelry",
  description:
    "Explore our complete collection of handmade fine jewelry, vintage hairpins, and luxury earrings. Certified 5-star customer ratings with 50% discount on Etsy.",
  alternates: {
    canonical: "https://fuegoforge.vercel.app",
  },
};

export default function HomePage() {
  const products = getAllProducts();
  const categories = getAllCategories();
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="space-y-20 pb-20">
      {/* Editorial Luxury Hero (Rouvenat Style) */}
      <section className="relative min-h-[75vh] flex items-center justify-center bg-[#F3EFEA] border-b border-[#EBE5DC] overflow-hidden px-4 py-20 text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <span className="inline-block text-[11px] font-sans uppercase tracking-[0.3em] text-[#B89758] font-semibold border-b border-[#B89758] pb-1">
            Circular & Artisan Joaillerie
          </span>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-light text-[#121212] tracking-tight leading-[1.08]">
            Timeless Heirlooms, <br />
            <span className="italic font-normal">Handcrafted for Eternity.</span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#5A5651] max-w-xl mx-auto font-light leading-relaxed">
            Every piece is created with meticulous devotion to form, proportion, and finish. Available with exclusive 50% off boutique pricing on Etsy.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#creations"
              className="w-full sm:w-auto px-8 py-4 bg-[#121212] hover:bg-[#B89758] text-[#FAF8F5] text-xs font-sans uppercase tracking-luxury transition-all duration-300 font-medium"
            >
              Explore Creations
            </a>
            <a
              href="https://fuegoforge.etsy.com?ref=share_and_save"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 border border-[#121212] text-[#121212] hover:bg-[#121212] hover:text-[#FAF8F5] text-xs font-sans uppercase tracking-luxury transition-all duration-300 font-medium inline-flex items-center justify-center gap-2"
            >
              <span>Shop Etsy Boutique</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Craftsmanship Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-[#EBE5DC]">
          <div className="text-center space-y-1 p-4">
            <Sparkles className="w-5 h-5 mx-auto text-[#B89758]" />
            <h4 className="font-editorial text-base text-[#121212]">Handmade Craft</h4>
            <p className="text-[11px] font-sans text-[#8E8A83]">Artisan small-batch finish</p>
          </div>
          <div className="text-center space-y-1 p-4">
            <Truck className="w-5 h-5 mx-auto text-[#B89758]" />
            <h4 className="font-editorial text-base text-[#121212]">Free Tracked Shipping</h4>
            <p className="text-[11px] font-sans text-[#8E8A83]">Dispatched with care</p>
          </div>
          <div className="text-center space-y-1 p-4">
            <ShieldCheck className="w-5 h-5 mx-auto text-[#B89758]" />
            <h4 className="font-editorial text-base text-[#121212]">Buyer Protection</h4>
            <p className="text-[11px] font-sans text-[#8E8A83]">Verified Etsy guarantee</p>
          </div>
          <div className="text-center space-y-1 p-4">
            <Star className="w-5 h-5 mx-auto text-[#B89758] fill-[#B89758]" />
            <h4 className="font-editorial text-base text-[#121212]">5.0 Star Seller</h4>
            <p className="text-[11px] font-sans text-[#8E8A83]">Top rated on Etsy</p>
          </div>
        </div>
      </section>

      {/* Category Discovery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#B89758]">
            Curated Universes
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#121212] font-light">
            Explore by Discipline
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative aspect-4/5 overflow-hidden bg-[#F3EFEA] border border-[#EBE5DC] flex flex-col justify-end p-6"
            >
              {cat.sampleImage && (
                <img
                  src={cat.sampleImage}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-90"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative text-left space-y-1 text-[#FAF8F5]">
                <span className="text-[10px] font-sans uppercase tracking-luxury text-[#B89758]">
                  {cat.count} Pieces
                </span>
                <h3 className="font-editorial text-xl sm:text-2xl text-[#FAF8F5] leading-tight group-hover:text-[#B89758] transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Product Gallery (SSG Grid) */}
      <section id="creations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#EBE5DC] pb-4 gap-4">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#B89758]">
              Catalog • Complete Collection
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#121212] font-light mt-1">
              The Artisan Archive
            </h2>
          </div>
          <span className="text-xs font-sans uppercase tracking-luxury text-[#8E8A83]">
            {products.length} Handcrafted Creations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Etsy Direct 50% Off Flash Promo Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#121212] text-[#FAF8F5] p-8 sm:p-14 border border-[#2B2927] text-center space-y-6">
          <span className="inline-block text-[11px] font-sans uppercase tracking-[0.3em] text-[#B89758]">
            Limited Exclusive Offer
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-light text-[#FAF8F5] max-w-2xl mx-auto leading-tight">
            Claim 50% Off Direct On Our <span className="italic">Verified Etsy Boutique</span>
          </h2>
          <p className="text-xs sm:text-sm font-sans text-[#8E8A83] max-w-lg mx-auto font-light leading-relaxed">
            All pieces feature instant 50% discount automatically applied at checkout with official buyer protection, tracked shipping, and verified 5-star reviews.
          </p>
          <div className="pt-2">
            <a
              href="https://fuegoforge.etsy.com?ref=share_and_save"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#B89758] hover:bg-[#FAF8F5] text-[#121212] text-xs font-sans uppercase tracking-luxury font-medium transition-all duration-300"
            >
              <span>Shop All 50% Off Creations on Etsy</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
