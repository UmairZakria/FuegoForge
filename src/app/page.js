import { Suspense } from "react";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/products";
import CatalogExplorer from "@/components/CatalogExplorer";
import CategoryCarousel from "@/components/CategoryCarousel";
import SplitPortraitGrid from "@/components/SplitPortraitGrid";
import EditorialJournal from "@/components/EditorialJournal";
import Parallax from "@/components/Parallax";
import SmartVideo from "@/components/SmartVideo";
import HeroReveal from "@/components/HeroReveal";
import { ArrowRight, ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";

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

  // Select authentic products with videoUrl for the hero preview cards
  const earringPreview =
    products.find((p) => p.slug.startsWith("pear-moissanite-huggie-hoops")) ||
    products.find((p) => p.category === "earrings" && p.videoUrl) ||
    products[0];
  const necklacePreview =
    products.find((p) => p.slug.startsWith("birth-flower-necklace")) ||
    products.find((p) => p.category === "necklaces" && p.videoUrl) ||
    products[1];
  const bentoNecklace =
    products.find((p) => p.slug.startsWith("gold-pearl-necklace-with-crystal-leaf")) ||
    necklacePreview;
  const bentoHuggie =
    products.find((p) => p.slug.startsWith("gold-tone-pearl-huggie-hoop")) ||
    earringPreview;

  const heroCategoryLinks = [
    { label: "earrings", href: "/category/earrings", active: true },
    { label: "necklaces", href: "/category/necklaces" },
    { label: "bracelets", href: "/category/bracelets" },
    { label: "hairpins", href: "/category/hair-accessories" },
    { label: "ring boxes", href: "/category/jewelry-boxes" },
  ];

  return (
    <div className="bg-transparent">
      {/* =====================================================================
          1. ASYMMETRIC EDITORIAL HERO (GSAP Choreographed Reveal)
         ===================================================================== */}
      <HeroReveal>
        <section className="relative min-h-screen flex flex-col justify-between bg-[#F4EFE6] overflow-hidden">
          {/* Seamless Full-Canvas Macro Portrait (Left 42% Portrait -> Right 58% Warm Ivory) */}
          <div
            data-hero-portrait="true"
            className="relative lg:absolute lg:inset-0 w-full h-[46vh] min-h-[300px] sm:h-[58vh] lg:h-full overflow-hidden select-none pointer-events-none"
          >
            <Parallax speed={0.14} scale={1.08} className="w-full h-full">
              <img
                data-hero-img="true"
                src="/hero-editorial.jpg"
                alt="Fuego Forge Editorial Campaign Portrait"
                className="w-full h-full object-cover object-[18%_25%] sm:object-[20%_center] lg:object-left will-change-transform"
              />
            </Parallax>
            {/* Subtle bottom fade on mobile so text below reads effortlessly */}
            <div className="lg:hidden absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F4EFE6] via-[#F4EFE6]/70 to-transparent" />
          </div>

          {/* Main Layered Editorial Stage */}
          <div className="layout-shell relative z-10 flex-1 flex flex-col justify-between pt-3 sm:pt-6 lg:pt-[clamp(76px,8vw,116px)] pb-5 lg:pb-[clamp(20px,2.2vw,36px)] gap-5 lg:gap-8">
            {/* Middle Stage: Oversized Layered Serif Headline + Right Editorial Manifesto */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center my-auto pt-0 lg:pt-10">
              {/* Oversized Multi-Tone Serif Headline Overlapping Portrait & Warm Ivory */}
              <Parallax speed={-0.06} className="lg:col-span-9">
                <h1 className="font-editorial text-[clamp(2.15rem,8.8vw,3.5rem)] lg:text-[clamp(2.5rem,5.9vw,7.1rem)] leading-[0.95] lg:leading-[0.94] font-light uppercase tracking-[-0.02em] select-none">
                  <span className="block overflow-hidden">
                    <span data-hero-line="true" className="block">
                      <span className="text-[#6E2628]">NOT FOR</span>{" "}
                      <span className="text-[#C5BEB5] font-extralight">SOMEDAY</span>
                    </span>
                  </span>
                  <span className="block overflow-hidden mt-1">
                    <span
                      data-hero-line="true"
                      className="block pl-0 sm:pl-10 lg:pl-[clamp(1.5rem,11.5vw,14.5rem)] text-[#171515]"
                    >
                      MADE TO LIVE IN
                    </span>
                  </span>
                </h1>
              </Parallax>

              {/* Right-Aligned Supporting Editorial Copy & Minimal CTA */}
              <div
                data-hero-fade="true"
                className="lg:col-span-3 lg:text-right flex flex-col lg:items-end justify-between space-y-3 lg:space-y-6 lg:pt-4"
              >
              <div className="space-y-1 max-w-[30ch] lg:ml-auto">
                <span className="text-[11px] font-cinzel-decorative uppercase tracking-[0.22em] text-[#ACA49B] block">
                  FUEGO FORGE
                </span>
                <p className="font-raleway text-[length:var(--text-sm)] text-[#6F675F] font-light leading-relaxed">
                  Made for skin, not display.
                  <br />
                  Made to order. Worn every day.
                </p>
              </div>

              <div className="pt-1 lg:pt-8">
                <a
                  href="https://fuegoforge.etsy.com?ref=share_and_save"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-raleway tracking-[0.02em] text-[#171515] hover:text-[var(--burgundy)] uppercase font-medium transition-colors group"
                >
                  <span>Shop on Etsy</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Lower-Right Editorial Macro Preview Cards (Warm Skin & Gold Jewelry) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end pt-1 lg:pt-2">
            <div className="hidden lg:block lg:col-span-6" />

            <div data-hero-fade="true" className="lg:col-span-6">
              <Parallax speed={-0.04} className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[660px] ml-auto w-full">
              {/* Preview Card 1: Pear Moissanite Gold Huggie on Skin */}
              {earringPreview && (
                <Link
                  href={`/product/${earringPreview.slug}`}
                  className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-[8px] overflow-hidden bg-[#3B2820] shadow-sm"
                >
                  {earringPreview.videoUrl ? (
                    <SmartVideo
                      src={earringPreview.videoUrl}
                      poster={earringPreview.mainImage}
                      priority
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <img
                      src={earringPreview.mainImage}
                      alt={earringPreview.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

                  <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-[#FAF7F2]">
                    <span className="text-[11px] font-poppins  tracking-[0.02em] text-[#FAF7F2]/95">
                      Earrings
                    </span>

                    <div className="flex items-end justify-between gap-2">
                      <span className="text-[11px] font-poppins italic font-light text-[#FAF7F2]/90 leading-tight">
                        many, worn as one
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#FAF7F2] group-hover:translate-x-0.5 transition-transform shrink-0">
                        <span>See more</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Preview Card 2: Gold Necklace on Collarbone */}
              {necklacePreview && (
                <Link
                  href={`/product/${necklacePreview.slug}`}
                  className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-[8px] overflow-hidden bg-[#3B2820] shadow-sm"
                >
                  {necklacePreview.videoUrl ? (
                    <SmartVideo
                      src={necklacePreview.videoUrl}
                      poster={necklacePreview.mainImage}
                      priority
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <img
                      src={necklacePreview.mainImage}
                      alt={necklacePreview.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

                  <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-[#FAF7F2]">
                    <span className="text-[11px] font-sans tracking-[0.02em] text-[#FAF7F2]/95">
                      Necklace
                    </span>

                    <div className="flex items-end justify-between gap-2">
                      <span className="text-[11px] font-poppins italic font-light text-[#FAF7F2]/90 leading-tight ">
                        a single stone, close to the skin
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#FAF7F2] group-hover:translate-x-0.5 transition-transform shrink-0">
                        <span>See more</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
              </Parallax>
            </div>
          </div>
        </div>

        {/* Bottom-Anchored Rounded Ivory Bar (Reference Signature Element) */}
        <div data-hero-bottom-bar="true" className="layout-shell relative z-20">
          <div className="bg-[#FAF8F4] rounded-t-[20px] border-t border-x border-[var(--border-light)]/70 px-5 sm:px-[clamp(20px,2.5vw,44px)] py-4 md:py-[clamp(16px,1.6vw,24px)] grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center">
            {/* Left: 3-Line Poetic Manifesto */}
            <div className="hidden sm:block md:col-span-4 text-[11px] font-sans text-[#ACA49B] leading-snug space-y-0.5">
              <p>made to order.</p>
              <p>fitted in person.</p>
              <p>worn every day after.</p>
            </div>

            {/* Center: Scroll Indicator */}
            <div className="hidden md:flex md:col-span-3 justify-center">
              <a
                href="#disciplines"
                className="inline-flex flex-col items-center gap-1 text-[10px] font-sans uppercase tracking-[0.22em] text-[var(--text-primary)] hover:text-[var(--burgundy)] transition-colors"
              >
                <ArrowDown className="w-3 h-3" />
                <span>SCROLL</span>
              </a>
            </div>

            {/* Right: Category Quick Navigation Links */}
            <nav
              aria-label="Hero Category Switcher"
              className="md:col-span-5 flex flex-wrap items-center justify-between sm:justify-start md:justify-end gap-x-4 gap-y-2 md:gap-[clamp(14px,1.8vw,28px)]"
            >
              {heroCategoryLinks.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className={`text-[length:var(--text-sm)] font-sans tracking-[0.01em] transition-colors pb-0.5 ${
                    cat.active
                      ? "text-[var(--text-primary)] border-b border-[var(--text-primary)] font-normal"
                      : "text-[#6F675F] hover:text-[var(--burgundy)]"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>
      </HeroReveal>

      {/* =====================================================================
          2. EDITORIAL BENTO SHOWCASE (4-Card Asymmetric Luxury Composition)
         ===================================================================== */}
      <section id="disciplines" className="layout-shell section-space">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-2 gap-[var(--grid-gap)] lg:h-[clamp(520px,42vw,660px)]">
          {/* Card 1 (Left Tall): Signature Collection */}
          <div className="lg:col-span-6 lg:row-span-2 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-12 items-stretch min-h-[420px] lg:min-h-0">
            <div className="sm:col-span-6 p-[clamp(24px,2.5vw,44px)] flex flex-col justify-center items-start space-y-4 z-10">
              <span className="text-[length:var(--text-xs)] font-raleway uppercase italic text-[var(--text-muted)] tracking-wide">
                The Aurelia Collection
              </span>
              <h2 className="font-cinzel-decorative text-[clamp(1.85rem,2vw,3rem)] font-light text-[var(--text-primary)] leading-[1.4]">
                Where Timeless Beauty Meets Craft
              </h2>
              <div className="pt-2">
                <Link
                  href="/category/necklaces"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-[11px] font-poppins font-medium uppercase  transition-colors"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="sm:col-span-6 relative min-h-[280px] sm:min-h-full overflow-hidden">
              <Parallax speed={0.07} scale={1.08} className="w-full h-full">
                {bentoNecklace?.videoUrl ? (
                  <SmartVideo
                    src={bentoNecklace.videoUrl}
                    poster={bentoNecklace.mainImage}
                    preload="none"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <img
                    src={
                      bentoNecklace?.mainImage ||
                      "https://i.etsystatic.com/58316748/r/il/4da9f8/8756490273/il_fullxfull.8756490273_r2i0.jpg"
                    }
                    alt="Gold Pearl Necklace Editorial"
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </Parallax>
            </div>
          </div>

          {/* Card 2 (Top Right Wide): Captivating Styles */}
          <div className="lg:col-span-6 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-12 items-stretch min-h-[240px] lg:min-h-0">
            <div className="sm:col-span-6 p-[clamp(20px,2vw,36px)] flex flex-col justify-center items-start space-y-3 z-10">
              <span className="text-[length:var(--text-xs)] font-raleway uppercase italic text-[var(--text-muted)] tracking-wide">
                The Lumina Line
              </span>
              <h3 className="font-cinzel-decorative text-[clamp(1.5rem,1.5vw,2.25rem)] font-medium text-[var(--text-primary)] leading-[1.1]">
                Captivating Styles for Everyday
              </h3>
              <div className="pt-1">
                <Link
                  href="/category/earrings"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-sm font-poppins font-light uppercase transition-colors"
                >
                  <span>Have A Look</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="sm:col-span-6 relative min-h-[200px] sm:min-h-full overflow-hidden">
              <Parallax speed={0.07} scale={1.08} className="w-full h-full">
                <img
                  src="https://i.etsystatic.com/58316748/r/il/c6bca4/8802651737/il_fullxfull.8802651737_orgb.jpg"
                  alt="Gold Botanical Necklace on Linen"
                  className="w-full h-full object-cover object-center"
                />
              </Parallax>
            </div>
          </div>

          {/* Card 3 (Bottom Middle): Sculpted Hoops */}
          <div className="lg:col-span-3 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] flex flex-col justify-between p-[clamp(18px,1.6vw,28px)] min-h-[250px] lg:min-h-0">
            <div className="flex items-start justify-between gap-3 z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-raleway uppercase italic text-[var(--text-muted)] block">
                  The Novara Series
                </span>
                <h3 className="font-cinzel-decorative text-[clamp(1.3rem,1.5vw,1.75rem)] font-light text-[var(--text-primary)] leading-tight">
                  Sculpted for City Living
                </h3>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 mt-3">
              <Link
                href="/category/bracelets"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-sm font-poppins font-light uppercase  transition-colors shrink-0 z-10"
              >
                <span>Visit Now</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[10px] overflow-hidden shrink-0 border border-[var(--border-light)]">
                {bentoHuggie?.videoUrl ? (
                  <SmartVideo
                    src={bentoHuggie.videoUrl}
                    poster={bentoHuggie.mainImage}
                    preload="none"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://i.etsystatic.com/58316748/r/il/67478a/8772228592/il_fullxfull.8772228592_hgds.jpg"
                    alt="Gold Crystal Huggie Hoops"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card 4 (Bottom Right Accent): 50% Off Exclusive Luxe (Burgundy Theme Card) */}
          <div className="lg:col-span-3 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[var(--burgundy)] text-[#FAF7F2] flex flex-col items-center justify-center text-center p-[clamp(20px,1.8vw,32px)] space-y-2.5 min-h-[250px] lg:min-h-0">
            <span className="text-[11px] font-raleway uppercase italic text-[#EADFD5]/85 tracking-wide">
              The Atelier Edit
            </span>
            <h3 className="font- text-[clamp(1.35rem,1.6vw,1.85rem)] font-light leading-tight">
              Exclusive Luxe
            </h3>
            <span className="font- text-[clamp(3rem,4.2vw,4.75rem)] font-light leading-none tracking-tight block py-1">
              50%
            </span>
            <div className="pt-1">
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[#FAF7F2] text-sm font-poppins font-medium uppercase  transition-colors"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. CATEGORY CAROUSEL (Minimalist Season Collection)
         ===================================================================== */}
      <CategoryCarousel categories={categories} />

      {/* =====================================================================
          4. SPLIT PORTRAIT 4x4 MOSAIC (Unsplash Editorial Showcase)
         ===================================================================== */}
      <SplitPortraitGrid />

      {/* =====================================================================
          5. COMPLETE ARTISAN ARCHIVE (Interactive Filter Sidebar + Fluid Grid)
         ===================================================================== */}
      <Suspense
        fallback={
          <section id="creations" className="layout-shell section-space">
            <div className="h-64 bg-[var(--bg-secondary)] animate-pulse" />
          </section>
        }
      >
        <CatalogExplorer products={products} categories={categories} />
      </Suspense>

      {/* =====================================================================
          5. EDITORIAL JOURNAL & STORIES (Above Footer)
         ===================================================================== */}
      <EditorialJournal />
    </div>
  );
}
