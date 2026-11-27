import { Suspense } from "react";
import Link from "next/link";
import { getAllProducts, getAllCategories } from "@/lib/products";
import { getSiteConfig } from "@/lib/site-config";
import CatalogExplorer from "@/components/CatalogExplorer";
import CategoryCarousel from "@/components/CategoryCarousel";
import SplitPortraitGrid from "@/components/SplitPortraitGrid";
import EditorialJournal from "@/components/EditorialJournal";
import Parallax from "@/components/Parallax";
import SmartVideo from "@/components/SmartVideo";
import HeroReveal from "@/components/HeroReveal";
import HeroFluidSlideshow from "@/components/HeroFluidSlideshow";
import { ArrowRight, ArrowDown, ArrowUpRight, ChevronRight } from "lucide-react";

export const metadata = {
  title: "FUEGO FORGE | Contemporary Handcrafted Fine Jewelry",
  description:
    "Explore our complete collection of handmade fine jewelry, vintage hairpins, and luxury earrings. Certified 5-star customer ratings with 50% discount on Etsy.",
  alternates: {
    canonical: "https://fuegoforge.vercel.app",
  },
};

function resolveHeroPreview(card, products, fallbackIdx = 0) {
  if (!card) return null;
  if (card.mode === "custom") {
    return {
      href: card.customHref || `/category/${card.categorySlug || "earrings"}`,
      videoUrl: card.customVideoUrl || "",
      mainImage: card.customPosterUrl || products[fallbackIdx]?.mainImage || "",
      title: card.label || "Collection",
      label: card.label || "Collection",
      caption: card.caption || "",
      ctaText: card.ctaText || "See more",
    };
  }
  if (card.mode === "category") {
    const match =
      products.find((p) => p.category === card.categorySlug && p.videoUrl) ||
      products.find((p) => p.category === card.categorySlug) ||
      products[fallbackIdx];
    if (!match) return null;
    return {
      href: `/category/${card.categorySlug || match.category}`,
      videoUrl: match.videoUrl || "",
      mainImage: match.mainImage || "",
      title: match.title,
      label: card.label || match.categoryName,
      caption: card.caption || "",
      ctaText: card.ctaText || "See more",
    };
  }
  const prod =
    products.find((p) => p.slug === card.productSlug) ||
    products.find((p) => card.productSlug && p.slug.startsWith(card.productSlug)) ||
    products.find((p) => p.category === card.categorySlug && p.videoUrl) ||
    products[fallbackIdx];
  if (!prod) return null;
  return {
    href: `/product/${prod.slug}`,
    videoUrl: prod.videoUrl || "",
    mainImage: prod.mainImage || "",
    title: prod.title,
    label: card.label || prod.categoryName,
    caption: card.caption || "",
    ctaText: card.ctaText || "See more",
  };
}

function resolveBentoMedia(card, products, fallbackProduct) {
  if (!card) return { videoUrl: "", imageUrl: "", alt: "Fuego Forge Editorial" };
  if (card.mediaMode === "custom") {
    return {
      videoUrl: card.customVideoUrl || "",
      imageUrl: card.customImageUrl || fallbackProduct?.mainImage || "",
      alt: card.title || "Fuego Forge Editorial",
    };
  }
  const prod =
    products.find((p) => p.slug === card.productSlug) ||
    products.find((p) => card.productSlug && p.slug.startsWith(card.productSlug)) ||
    fallbackProduct;
  return {
    videoUrl: card.preferVideo !== false ? prod?.videoUrl || "" : "",
    imageUrl: prod?.mainImage || card.customImageUrl || "",
    alt: prod?.title || card.title || "Fuego Forge Editorial",
  };
}

export default function HomePage() {
  const products = getAllProducts();
  const categories = getAllCategories();
  const siteConfig = getSiteConfig();

  const hero = siteConfig.hero || {};
  const bento = siteConfig.bento || {};

  const heroSlides =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides
      : ["/hero-editorial.webp", "/hero2_transparent.webp"];

  const previewSlots = (hero.previewCards || []).slice(0, 2);
  const heroCard1 = resolveHeroPreview(previewSlots[0], products, 0);
  const heroCard2 = resolveHeroPreview(previewSlots[1], products, 1);

  const bentoCard1Media = resolveBentoMedia(bento.card1, products, products[0]);
  const bentoCard2Media = resolveBentoMedia(bento.card2, products, products[1]);
  const bentoCard3Media = resolveBentoMedia(bento.card3, products, products[0]);

  const heroCategoryLinks =
    Array.isArray(hero.bottomCategoryLinks) && hero.bottomCategoryLinks.length > 0
      ? hero.bottomCategoryLinks
      : [
          { label: "earrings", href: "/category/earrings", active: true },
          { label: "necklaces", href: "/category/necklaces" },
          { label: "bracelets", href: "/category/bracelets" },
          { label: "hairpins", href: "/category/hair-accessories" },
        ];

  const bottomManifesto =
    Array.isArray(hero.bottomManifesto) && hero.bottomManifesto.length > 0
      ? hero.bottomManifesto
      : ["made to order.", "fitted in person.", "worn every day after."];

  return (
    <div className="bg-transparent">
      {/* =====================================================================
          1. ASYMMETRIC EDITORIAL HERO (GSAP Choreographed Reveal)
         ===================================================================== */}
      <HeroReveal>
        <section className="relative min-h-screen flex flex-col justify-between overflow-hidden">
          {/* Seamless Full-Canvas Macro Portrait */}
          <div
            data-hero-portrait="true"
            className="relative shrink-0 lg:absolute lg:inset-0 w-full h-[70vh] min-h-[420px] sm:h-[72vh] lg:h-full overflow-hidden select-none pointer-events-none"
          >
            <Parallax speed={0.14} scale={1.04} className="w-full h-full">
              <HeroFluidSlideshow
                images={heroSlides}
                alt="Fuego Forge Editorial Campaign Portrait"
                intervalMs={hero.intervalMs || 9500}
                transitionMs={2350}
                gridRows={12}
                objectPosition={[0, 0.5]}
                strength={0.26}
                className="w-full h-full"
                imgClassName="object-left will-change-transform"
              />
            </Parallax>
            <div className="lg:hidden absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#F2EDE5] via-[#F2EDE5]/80 via-40% to-transparent" />
          </div>

          {/* Main Layered Editorial Stage */}
          <div className="layout-shell relative z-10 flex-1 flex flex-col justify-between -mt-42 md:mt-0 pt-0 lg:pt-[clamp(76px,8vw,116px)] pb-5 lg:pb-[clamp(20px,2.2vw,36px)] gap-5 lg:gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center my-auto pt-0 lg:pt-10">
              <Parallax speed={-0.06} className="lg:col-span-9">
                <h1 className="font-cinzel text-[clamp(2.2rem,9.2vw,3.6rem)] lg:text-[clamp(2.5rem,5.9vw,7.1rem)] leading-[0.95] lg:leading-[0.94] font-light uppercase select-none">
                  <span className="block overflow-hidden">
                    <span data-hero-line="true" className="block">
                      <span className="text-[#6E2628]">{hero.headlineAccent || "NOT FOR"}</span>{" "}
                      <span className="text-[#8F877E] lg:text-[#C5BEB5] font-extralight">
                        {hero.headlineMuted || "SOMEDAY"}
                      </span>
                    </span>
                  </span>
                  <span className="block overflow-hidden mt-1">
                    <span
                      data-hero-line="true"
                      className="block pl-0 sm:pl-10 lg:pl-[clamp(1.5rem,11.5vw,14.5rem)] text-[#171515]"
                    >
                      {hero.headlineLine2 || "MADE TO LIVE IN"}
                    </span>
                  </span>
                </h1>
              </Parallax>

              <div
                data-hero-fade="true"
                className="lg:col-span-3 lg:text-right flex flex-row items-end justify-between gap-4 lg:flex-col lg:items-end lg:space-y-6 lg:pt-4"
              >
                <div className="space-y-1 max-w-[26ch] lg:max-w-[30ch] lg:ml-auto">
                  <span className="text-[11px] font-cinzel-decorative uppercase tracking-[0.22em] text-[#8E867E] lg:text-[#ACA49B] block">
                    {hero.eyebrow || "FUEGO FORGE"}
                  </span>
                  <p className="font-raleway text-[length:var(--text-sm)] text-[#6F675F] font-light leading-relaxed">
                    {hero.subtextLine1 || "Made for skin, not display."}
                    <br />
                    {hero.subtextLine2 || "Made to order. Worn every day."}
                  </p>
                </div>

                <div className="pt-1 lg:pt-8 shrink-0">
                  <a
                    href={hero.ctaHref || "https://fuegoforge.etsy.com?ref=share_and_save"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-raleway tracking-[0.02em] text-[#171515] hover:text-[var(--burgundy)] uppercase font-medium transition-colors group"
                  >
                    <span>{hero.ctaLabel || "Shop on Etsy"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* Lower-Right Editorial Macro Video/Image Preview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-end pt-1 lg:pt-2">
              <div className="hidden lg:block lg:col-span-6" />

              <div data-hero-fade="true" className="lg:col-span-6">
                <Parallax
                  speed={-0.04}
                  className="grid grid-cols-2 gap-3 sm:gap-4 max-w-[660px] ml-auto w-full"
                >
                  {[heroCard1, heroCard2].filter(Boolean).map((card, idx) => (
                    <Link
                      key={`${card.href}-${idx}`}
                      href={card.href}
                      className="group relative aspect-[4/3] sm:aspect-[16/10] rounded-[8px] overflow-hidden bg-[#3B2820] shadow-sm"
                    >
                      {card.videoUrl ? (
                        <SmartVideo
                          src={card.videoUrl}
                          poster={card.mainImage}
                          priority
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <img
                          src={card.mainImage}
                          alt={card.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

                      <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-[#FAF7F2]">
                        <span className="text-[11px] uppercase font-poppins tracking-[0.02em] text-[#FAF7F2]/95">
                          {card.label}
                        </span>

                        <div className="flex items-end justify-end md:justify-between gap-2">
                          <span className="text-[11px] md:visible hidden font-poppins italic font-light text-[#FAF7F2]/90 leading-tight">
                            {card.caption}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#FAF7F2] group-hover:translate-x-0.5 transition-transform shrink-0">
                            <span>{card.ctaText}</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </Parallax>
              </div>
            </div>
          </div>

          {/* Bottom-Anchored Rounded Burgundy Bar */}
          <div data-hero-bottom-bar="true" className="layout-shell relative z-20">
            <div className="bg-[var(--burgundy)] text-white rounded-[20px] px-5 sm:px-[clamp(20px,2.5vw,44px)] py-4 md:py-[clamp(16px,1.6vw,24px)] grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center">
              <div className="hidden sm:block md:col-span-4 text-[11px] font-sans text-[#bdbab7] leading-snug space-y-0.5">
                {bottomManifesto.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="hidden md:flex md:col-span-3 justify-center">
                <a
                  href="#disciplines"
                  className="inline-flex flex-col items-center gap-1 text-[10px] font-sans uppercase tracking-[0.22em] text-white transition-colors"
                >
                  <ArrowDown className="w-3 h-3" />
                  <span>SCROLL</span>
                </a>
              </div>

              <nav
                aria-label="Hero Category Switcher"
                className="md:col-span-5 flex flex-wrap items-center justify-between sm:justify-start md:justify-end gap-x-4 gap-y-2 md:gap-[clamp(14px,1.8vw,28px)]"
              >
                {heroCategoryLinks.map((cat) => (
                  <Link
                    key={`${cat.label}-${cat.href}`}
                    href={cat.href}
                    className={`text-[length:var(--text-sm)] font-sans tracking-[0.01em] transition-colors uppercase pb-0.5 ${
                      cat.active
                        ? "text-white hover:text-white/80 border-b pb-2 border-white/50 font-normal"
                        : "text-white/80 pb-2 hover:text-white"
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
          {/* Card 1 (Left Tall) */}
          <div className="lg:col-span-6 lg:row-span-2 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-12 items-stretch min-h-[420px] lg:min-h-0">
            <div className="sm:col-span-6 p-[clamp(24px,2.5vw,44px)] flex flex-col justify-center items-start space-y-4 z-10">
              <span className="text-[length:var(--text-xs)] font-raleway uppercase italic text-[var(--text-muted)] tracking-wide">
                {bento.card1?.eyebrow || "The Aurelia Collection"}
              </span>
              <h2 className="font-cinzel-decorative text-[clamp(1.85rem,2vw,3rem)] font-light text-[var(--text-primary)] leading-[1.4]">
                {bento.card1?.title || "Where Timeless Beauty Meets Craft"}
              </h2>
              <div className="pt-2">
                <Link
                  href={bento.card1?.ctaHref || "/category/necklaces"}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-[11px] font-poppins font-medium uppercase transition-colors"
                >
                  <span>{bento.card1?.ctaLabel || "Shop Now"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="sm:col-span-6 relative min-h-[280px] sm:min-h-full overflow-hidden">
              <Parallax speed={0.07} scale={1.08} className="w-full h-full">
                {bentoCard1Media.videoUrl ? (
                  <SmartVideo
                    src={bentoCard1Media.videoUrl}
                    poster={bentoCard1Media.imageUrl}
                    preload="none"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <img
                    src={bentoCard1Media.imageUrl}
                    alt={bentoCard1Media.alt}
                    className="w-full h-full object-cover object-top"
                  />
                )}
              </Parallax>
            </div>
          </div>

          {/* Card 2 (Top Right Wide) */}
          <div className="lg:col-span-6 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] grid grid-cols-1 sm:grid-cols-12 items-stretch min-h-[240px] lg:min-h-0">
            <div className="sm:col-span-6 p-[clamp(20px,2vw,36px)] flex flex-col justify-center items-start space-y-3 z-10">
              <span className="text-[length:var(--text-xs)] font-raleway uppercase italic text-[var(--text-muted)] tracking-wide">
                {bento.card2?.eyebrow || "The Lumina Line"}
              </span>
              <h3 className="font-cinzel text-[clamp(1.5rem,1.5vw,2.25rem)] font-medium text-[var(--text-primary)] leading-[1.1]">
                {bento.card2?.title || "Captivating Styles for Everyday"}
              </h3>
              <div className="pt-1">
                <Link
                  href={bento.card2?.ctaHref || "/category/earrings"}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-sm font-poppins font-light uppercase transition-colors"
                >
                  <span>{bento.card2?.ctaLabel || "Have A Look"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="sm:col-span-6 relative min-h-[200px] sm:min-h-full overflow-hidden">
              <Parallax speed={0.07} scale={1.08} className="w-full h-full">
                {bentoCard2Media.videoUrl ? (
                  <SmartVideo
                    src={bentoCard2Media.videoUrl}
                    poster={bentoCard2Media.imageUrl}
                    preload="none"
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <img
                    src={bentoCard2Media.imageUrl}
                    alt={bentoCard2Media.alt}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </Parallax>
            </div>
          </div>

          {/* Card 3 (Bottom Middle) */}
          <div className="lg:col-span-3 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[#FAF7F2] border border-[var(--border-light)] flex flex-col justify-between p-[clamp(18px,1.6vw,28px)] min-h-[250px] lg:min-h-0">
            <div className="flex items-start justify-between gap-3 z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-raleway uppercase italic text-[var(--text-muted)] block">
                  {bento.card3?.eyebrow || "The Novara Series"}
                </span>
                <h3 className="font-cinzel-decorative text-[clamp(1.3rem,1.5vw,1.75rem)] font-normal text-[var(--text-primary)] leading-tight">
                  {bento.card3?.title || "Sculpted for City Living"}
                </h3>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3 mt-3">
              <Link
                href={bento.card3?.ctaHref || "/category/bracelets"}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-primary)] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[var(--bg-primary)] border border-[var(--border-strong)] text-sm font-poppins font-light uppercase transition-colors shrink-0 z-10"
              >
                <span>{bento.card3?.ctaLabel || "Visit Now"}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[10px] overflow-hidden shrink-0 border border-[var(--border-light)]">
                {bentoCard3Media.videoUrl ? (
                  <SmartVideo
                    src={bentoCard3Media.videoUrl}
                    poster={bentoCard3Media.imageUrl}
                    preload="none"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={bentoCard3Media.imageUrl}
                    alt={bentoCard3Media.alt}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Card 4 (Bottom Right Accent Burgundy Tile) */}
          <div className="lg:col-span-3 lg:row-span-1 relative rounded-[16px] overflow-hidden bg-[var(--burgundy)] text-[#FAF7F2] flex flex-col items-center justify-center text-center p-[clamp(20px,1.8vw,32px)] space-y-2.5 min-h-[250px] lg:min-h-0">
            <span className="text-[11px] font-raleway uppercase italic text-[#EADFD5]/85 tracking-wide">
              {bento.card4?.eyebrow || "The Atelier Edit"}
            </span>
            <h3 className="font- text-[clamp(1.35rem,1.6vw,1.85rem)] font-light leading-tight">
              {bento.card4?.title || "Exclusive Luxe"}
            </h3>
            <span className="font- text-[clamp(3rem,4.2vw,4.75rem)] font-light leading-none tracking-tight block py-1">
              {bento.card4?.highlight || "50%"}
            </span>
            <div className="pt-1">
              <a
                href={bento.card4?.ctaHref || "https://fuegoforge.etsy.com?ref=share_and_save"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[var(--bg-dark)] text-[var(--text-primary)] hover:text-[#FAF7F2] text-sm font-poppins font-medium uppercase transition-colors"
              >
                <span>{bento.card4?.ctaLabel || "Shop Now"}</span>
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
          4. SPLIT PORTRAIT 4x4 MOSAIC
         ===================================================================== */}
      {siteConfig.splitPortrait?.enabled !== false && <SplitPortraitGrid />}

      {/* =====================================================================
          5. COMPLETE ARTISAN ARCHIVE
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
          6. EDITORIAL JOURNAL & STORIES
         ===================================================================== */}
      {siteConfig.journal?.enabled !== false && <EditorialJournal />}
    </div>
  );
}
