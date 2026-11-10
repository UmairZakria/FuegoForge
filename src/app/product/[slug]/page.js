import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { Star, ShieldCheck, Truck, RefreshCw, Sparkles, ArrowRight, ExternalLink } from "lucide-react";

// SSG: Pre-render all 40 product pages statically at build time
export async function generateStaticParams() {
  const products = getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Dynamic SEO Metadata for every single product
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | FUEGO FORGE" };
  }

  const title = `${product.title} | FUEGO FORGE`;
  const description = `${product.title}. Handcrafted luxury fine jewelry by Fuego Forge. Get 50% off on Etsy with free shipping. Rated 5.0 stars.`;
  const canonicalUrl = `https://fuegoforge.vercel.app/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: product.mainImage,
          width: 1000,
          height: 1000,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.mainImage],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const allProducts = getAllProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  // Complete Schema.org Product Rich Snippet for Google & Bing
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "FUEGO FORGE",
    },
    category: product.categoryName,
    offers: {
      "@type": "Offer",
      url: product.etsyUrl,
      priceCurrency: "USD",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "FUEGO FORGE on Etsy",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: String(product.reviewsCount || 48),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://fuegoforge.vercel.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.categoryName,
        item: `https://fuegoforge.vercel.app/category/${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `https://fuegoforge.vercel.app/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs font-sans uppercase tracking-luxury text-[#8E8A83]">
          <Link href="/" className="hover:text-[#121212] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/category/${product.category}`} className="hover:text-[#121212] transition-colors">
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-[#121212] truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Showcase: Gallery (Left) & Sticky Purchase Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Right Column: Sticky Purchase Details */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="space-y-2 border-b border-[#EBE5DC] pb-6">
              <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#B89758] font-semibold block">
                {product.categoryName} • Artisan Crafted
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#121212] leading-tight font-light">
                {product.title}
              </h1>

              {/* Rating & In-Stock indicator */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1 text-xs font-sans text-[#121212]">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#B89758] text-[#B89758]" />
                    ))}
                  </div>
                  <span className="font-medium">5.0</span>
                  <span className="text-[#8E8A83]">({product.reviewsCount} reviews)</span>
                </div>
                <span className="text-xs text-[#8E8A83]">•</span>
                <span className="text-xs font-sans text-emerald-800 font-medium">
                  In Stock on Etsy
                </span>
              </div>
            </div>

            {/* Price section with 50% OFF strike-through */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-sans font-medium text-[#121212]">
                  ${Number(product.price).toFixed(2)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-lg font-sans text-[#8E8A83] line-through">
                    ${Number(product.originalPrice).toFixed(2)}
                  </span>
                )}
                <span className="px-2.5 py-0.5 bg-[#121212] text-[#FAF8F5] text-[10px] font-sans font-semibold tracking-luxury uppercase">
                  50% OFF FLASH DEAL
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#5A5651]">
                Taxes included. Free tracked shipping on Etsy.
              </p>
            </div>

            {/* Primary Action Button: "GET 50% OFF ON ETSY" */}
            <div className="pt-2 space-y-3">
              <a
                href={product.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#121212] hover:bg-[#B89758] text-[#FAF8F5] text-xs font-sans uppercase tracking-[0.25em] font-medium transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Get 50% Off on Etsy</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <p className="text-center text-[11px] font-sans text-[#8E8A83]">
                Secured checkout & buyer protection directly on Etsy Boutique
              </p>
            </div>

            {/* Description & Materials Accordions */}
            <div className="border-t border-[#EBE5DC] pt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xs font-sans uppercase tracking-luxury text-[#121212] font-semibold">
                  Creation Description
                </h3>
                <p className="font-sans text-xs sm:text-sm text-[#5A5651] leading-relaxed whitespace-pre-line font-light">
                  {product.description}
                </p>
              </div>

              {/* Artisan Highlights */}
              <div className="space-y-2">
                <h3 className="text-xs font-sans uppercase tracking-luxury text-[#121212] font-semibold">
                  Artisan Specifications
                </h3>
                <ul className="space-y-1.5 text-xs font-sans text-[#5A5651]">
                  {(product.details || []).map((detail, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
                      <span>{detail}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B89758]" />
                    <span>Materials: {product.materials}</span>
                  </li>
                </ul>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EBE5DC]">
                <div className="flex items-center gap-2 text-xs font-sans text-[#5A5651]">
                  <Truck className="w-4 h-4 text-[#B89758] shrink-0" />
                  <span>Free Dispatched Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-sans text-[#5A5651]">
                  <ShieldCheck className="w-4 h-4 text-[#B89758] shrink-0" />
                  <span>Etsy Purchase Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Creations Grid */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[#EBE5DC] pt-16 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-[#B89758]">
                Complementary Pieces
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-[#121212] font-light">
                You May Also Admire
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
