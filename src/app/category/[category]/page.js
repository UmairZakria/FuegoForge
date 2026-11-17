import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllCategories, getProductsByCategory } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categories = getAllCategories();
  const currentCat = categories.find((c) => c.slug === category);

  if (!currentCat) {
    return { title: "Collection | FUEGO FORGE" };
  }

  const title = `${currentCat.name} Collection | FUEGO FORGE`;
  const description = `Shop handcrafted ${currentCat.name.toLowerCase()} by Fuego Forge. Contemporary luxury, certified 5-star ratings, 50% discount on Etsy.`;
  const canonicalUrl = `https://fuegoforge.vercel.app/category/${currentCat.slug}`;
  const ogImage =
    currentCat.sampleImage ||
    "https://i.etsystatic.com/58316748/c/932/932/330/130/il/66d1a3/8789393707/il_800x800.8789393707_i4u1.jpg";

  return {
    title,
    description,
    keywords: [
      currentCat.name,
      `Handcrafted ${currentCat.name}`,
      "Fuego Forge",
      "Luxury Artisan Jewelry",
      "Etsy 50% Off Jewelry",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: ogImage,
          width: 1000,
          height: 1000,
          alt: `${currentCat.name} Collection`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categories = getAllCategories();
  const currentCat = categories.find((c) => c.slug === category);

  if (!currentCat) notFound();

  const products = getProductsByCategory(category);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${currentCat.name} Collection | FUEGO FORGE`,
    url: `https://fuegoforge.vercel.app/category/${currentCat.slug}`,
    description: `Handcrafted ${currentCat.name.toLowerCase()} by Fuego Forge.`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://fuegoforge.vercel.app/product/${p.slug}`,
        name: p.title,
      })),
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
        name: currentCat.name,
        item: `https://fuegoforge.vercel.app/category/${currentCat.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="layout-shell pt-[clamp(84px,8vw,116px)] pb-[var(--section-gap)] space-y-[var(--block-gap)]">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-poppins text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">{currentCat.name}</span>
        </nav>

        {/* Left-Aligned Category Header Split */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-[var(--border-light)] pb-8">
          <div className="space-y-1.5">
            <span className="text-xs font-poppins text-[#9E2A30] font-medium block">
              Curated Discipline
            </span>
            <h1 className="font-editorial type-h1 text-[var(--text-primary)] font-light uppercase leading-[0.98]">
              {currentCat.name}
            </h1>
            <p className="font-poppins text-sm text-[var(--text-secondary)] max-w-2xl font-light leading-relaxed pt-1">
              {currentCat.count} handcrafted {currentCat.count === 1 ? "piece" : "pieces"} available with exclusive 50% off boutique pricing.
            </p>
          </div>

          {/* Rounded Category Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/#creations"
              className="px-4 py-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] text-xs font-poppins font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[#171515] hover:border-[#171515] transition-colors"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-xs font-poppins font-medium transition-all ${
                  cat.slug === category
                    ? "bg-[#171515] text-white border border-[#171515]"
                    : "border border-[var(--border-light)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#171515] hover:border-[#171515]"
                }`}
              >
                {cat.name} ({cat.count})
              </Link>
            ))}
          </div>
        </div>

        {/* Fluid Multi-Column Products Grid */}
        <div className="fluid-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
