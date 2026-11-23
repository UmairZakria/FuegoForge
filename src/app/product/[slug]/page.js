import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import WishlistButton from "@/components/WishlistButton";
import ProductPageReveal from "@/components/ProductPageReveal";
import { Star, ArrowRight } from "lucide-react";

// SSG: Pre-render all product pages statically at build time
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
  const ratingText = Number(product.rating || 4.9).toFixed(1);
  const description = `${product.title}. Handcrafted luxury fine jewelry by Fuego Forge. Get 50% off on Etsy with free shipping. Rated ${ratingText} stars.`;
  const canonicalUrl = `https://fuegoforge.vercel.app/product/${product.slug}`;

  return {
    title,
    description,
    keywords: [
      ...(product.tags || []),
      product.categoryName,
      product.materials,
      "Fuego Forge",
      "Handcrafted Jewelry",
    ].filter(Boolean),
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
    .slice(0, 6);

  // Complete Schema.org Product Rich Snippet for Google & Bing
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    sku: product.id,
    name: product.title,
    image: product.images,
    description: product.description,
    material: product.materials,
    brand: {
      "@type": "Brand",
      name: "FUEGO FORGE",
    },
    category: product.categoryName,
    ...(product.tags?.length ? { keywords: product.tags.join(", ") } : {}),
    ...(product.videoUrl
      ? {
          subjectOf: {
            "@type": "VideoObject",
            name: `${product.title} — Product Film`,
            description: product.description,
            thumbnailUrl: [product.mainImage],
            contentUrl: product.videoUrl,
            uploadDate: product.createdAt || "2026-11-16T00:00:00.000Z",
          },
        }
      : {}),
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
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating || 4.9).toFixed(1),
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

      <ProductPageReveal slug={product.slug}>
        <div className="layout-shell pt-[clamp(84px,8vw,116px)] pb-[clamp(36px,4vw,64px)] space-y-[var(--section-gap)]">
          {/* Breadcrumb Bar */}
          <nav
            data-product-breadcrumb="true"
            className="flex items-center gap-2 text-[length:var(--text-xs)] font-sans uppercase tracking-luxury text-[var(--text-muted)]"
          >
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${product.category}`}
              className="hover:text-[var(--text-primary)] transition-colors"
            >
              {product.categoryName}
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] truncate max-w-md">{product.title}</span>
          </nav>

          {/* Product Showcase: Gallery (Left) & Sticky Purchase Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--block-gap)] items-start">
            {/* Left Column: Gallery (Images + Product Video) */}
            <div data-product-gallery="true" className="lg:col-span-7 xl:col-span-7">
              <ProductGallery
                images={product.images}
                videoUrl={product.videoUrl}
                title={product.title}
              />
            </div>

            {/* Right Column: Clean, Bold Editorial Purchase Panel */}
            <div
              data-product-panel="true"
              className="lg:col-span-5 xl:col-span-5 space-y-7 lg:sticky lg:top-[calc(var(--header-height)+24px)] bg-[var(--bg-card)]/90 border border-[var(--border-light)] rounded-[12px] p-[var(--panel-padding)]"
            >
              {/* Category + Save Favorite Button + Title */}
              <div data-product-stagger="true" className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-poppins text-[var(--burgundy)] font-medium block">
                    {product.categoryName}
                  </span>
                  <WishlistButton product={product} />
                </div>

                <h1 className="font-cormorant  text-[clamp(1.75rem,2.3vw,2.6rem)] leading-[1.08] font-medium  italic text-[#171515] ">
                  {product.title}
                </h1>
              </div>

              {/* Unboxed Bold Price & Rating Row */}
              <div
                data-product-stagger="true"
                className="flex items-baseline justify-between gap-4 pb-6 border-b border-[var(--border-light)]"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-poppins text-3xl sm:text-4xl font-semibold text-[#171515] tracking-tight">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="font-poppins text-base sm:text-lg text-[var(--text-muted)] line-through font-light">
                      ${Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-poppins text-[var(--text-secondary)]">
                  <Star className="w-3.5 h-3.5 fill-[#171515] text-[#171515]" />
                  <span className="font-semibold text-[#171515]">
                    {Number(product.rating || 4.9).toFixed(1)}
                  </span>
                  <span className="text-[var(--text-muted)]">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Bold Architectural CTA Stack */}
              <div data-product-stagger="true" className="space-y-3">
              {/* Primary Buy Now Button */}
              <a
                href={product.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-13 px-6 rounded-full bg-[#171515] hover:bg-[var(--burgundy)] text-white flex items-center justify-center gap-2 font-poppins text-[15px] font-medium tracking-normal transition-colors duration-300 cursor-pointer"
              >
                <span>Buy Now — ${Number(product.price).toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Official Etsy Brand Button (Authentic Etsy Vector Wordmark) */}
              <a
                href={product.etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buy on Etsy"
                className="w-full h-13 px-6 rounded-full bg-[#F1641E] hover:bg-[#D75413] text-white flex items-center justify-center gap-2 font-poppins text-[15px] font-medium tracking-normal transition-colors duration-300 cursor-pointer"
              >
                <span>Buy on</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 24"
                  aria-hidden="true"
                  className="h-5 w-auto fill-current translate-y-[1px]"
                >
                  <path d="M6.547,3.125v6.008c0,0,2.117,0,3.25-0.086c0.891-0.156,1.055-0.242,1.219-1.133l0.328-1.305h0.969l-0.164,2.852 l0.086,2.922h-0.977l-0.242-1.141c-0.242-0.812-0.57-0.977-1.219-1.055c-0.812-0.086-3.25-0.086-3.25-0.086v5.039 c0,0.969,0.492,1.383,1.625,1.383h3.414c1.055,0,2.109-0.086,2.766-1.625l0.883-1.953h0.82c-0.086,0.406-0.492,3.984-0.57,4.789 c0,0-3.086-0.078-4.383-0.078H5.25l-3.492,0.078v-0.883l1.133-0.25c0.82-0.164,1.062-0.406,1.062-1.055 c0,0,0.086-2.195,0.086-5.852c0-3.648-0.086-5.844-0.086-5.844c0-0.727-0.242-0.891-1.062-1.055L1.758,2.555V1.664l3.414,0.07h6.5 c1.297,0,3.484-0.234,3.484-0.234s-0.078,1.375-0.164,4.625h-0.891l-0.328-1.141c-0.32-1.461-0.805-2.188-1.703-2.188H6.961 C6.547,2.797,6.547,2.875,6.547,3.125z M19.703,3.766h0.977V7.18l3.336-0.164l-0.164,1.547l-3.25-0.25v6.016 c0,1.703,0.57,2.359,1.547,2.359c0.883,0,1.539-0.492,1.781-0.898l0.484,0.57c-0.484,1.133-1.859,1.703-3.164,1.703 c-1.617,0-2.93-0.969-2.93-2.836V8.398h-1.938V7.586C18.008,7.422,19.219,6.445,19.703,3.766z M26.695,14.242l0.648,1.547 c0.242,0.648,0.812,1.305,2.109,1.305c1.383,0,1.953-0.734,1.953-1.625c0-2.766-5.445-1.953-5.445-5.688c0-2.109,1.703-3.094,3.898-3.094c0.977,0,2.438,0.164,3.172,0.492c-0.164,0.812-0.25,1.867-0.25,2.68l-0.805,0.078l-0.57-1.625 c-0.164-0.398-0.82-0.727-1.625-0.727c-0.977,0-1.953,0.406-1.953,1.461c0,2.516,5.609,1.953,5.609,5.688c0,2.117-1.867,3.25-4.148,3.25c-1.703,0-3.414-0.656-3.414-0.656c0.164-0.969,0.086-2.023,0-3.086H26.695z M33.031,22.039 c0.242-0.891,0.406-2.023,0.57-3.086l0.891-0.078l0.328,1.703c0.078,0.406,0.32,0.734,0.969,0.734c1.055,0,2.438-0.648,3.742-2.922 c-0.578-1.383-2.281-5.844-3.828-9.258c-0.406-0.898-0.484-0.977-1.047-1.141l-0.414-0.156v-0.82l2.445,0.086l3-0.164V7.75 l-0.734,0.164c-0.57,0.078-0.805,0.398-0.805,0.727c0,0.086,0,0.164,0.078,0.328c0.156,0.492,1.461,4.141,2.438,6.578c0.805-1.703,2.352-5.523,2.594-6.172c0.086-0.328,0.164-0.406,0.164-0.648c0-0.414-0.242-0.656-0.805-0.812L42.039,7.75V6.938 l2.281,0.078l2.109-0.078V7.75l-0.406,0.32c-0.812,0.328-0.898,0.406-1.219,1.062l-3.57,8.359 c-2.117,4.797-4.312,5.203-5.852,5.203C34.406,22.695,33.672,22.445,33.031,22.039z" />
                </svg>
              </a>

              <p className="pt-1 text-xs font-poppins text-[var(--text-muted)] font-light text-center">
                Complimentary tracked shipping &amp; buyer protection included.
              </p>
            </div>

            {/* Clean Editorial Description & Specifications */}
            <div data-product-stagger="true" className="border-t border-[var(--border-light)] pt-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xs font-poppins font-medium text-[#171515]">
                  Description
                </h2>
                <p className="font-poppins text-[length:var(--text-sm)] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line font-light">
                  {product.description}
                </p>
              </div>

              <div className="space-y-2.5 pt-5 border-t border-[var(--border-light)]">
                <h2 className="text-xs font-poppins font-medium text-[#171515]">
                  Details &amp; Materials
                </h2>
                <ul className="space-y-1.5 text-[length:var(--text-sm)] font-poppins text-[var(--text-secondary)] font-light">
                  <li className="text-[#171515] font-normal">
                    Materials: {product.materials}
                  </li>
                  {(product.details || []).map((detail, i) => (
                    <li key={i}>• {detail}</li>
                  ))}
                </ul>
              </div>

              {product.tags?.length > 0 && (
                <div className="space-y-2.5 pt-5 border-t border-[var(--border-light)]">
                  <h2 className="text-xs font-poppins font-medium text-[#171515]">
                    Keywords &amp; Style Tags
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/?q=${encodeURIComponent(tag)}#creations`}
                        className="px-2.5 py-1 rounded-full border border-[var(--border-light)] bg-[var(--bg-primary)] hover:border-[#9E2A30] hover:text-[#9E2A30] text-[11px] font-poppins text-[var(--text-secondary)] capitalize transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Creations Grid — Left-Aligned Header */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-[var(--border-light)] pt-[var(--block-gap)] space-y-[var(--block-gap)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-poppins text-[#9E2A30] font-medium block">
                  Complementary Pieces
                </span>
                <h2 className="font-editorial type-h2 text-[var(--text-primary)] font-light">
                  You May Also Admire
                </h2>
              </div>
              <Link
                href={`/category/${product.category}`}
                className="text-xs font-poppins font-medium text-[var(--text-primary)] hover:text-[#9E2A30] transition-colors"
              >
                View All {product.categoryName} →
              </Link>
            </div>
            <div className="fluid-product-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
        </div>
      </ProductPageReveal>
    </>
  );
}
