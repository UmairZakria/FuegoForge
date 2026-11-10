import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getAllCategories, getProductsByCategory } from "@/lib/products";
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

  return {
    title,
    description,
    alternates: {
      canonical: `https://fuegoforge.vercel.app/category/${currentCat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://fuegoforge.vercel.app/category/${currentCat.slug}`,
      images: [
        {
          url: currentCat.sampleImage || "https://i.etsystatic.com/58316748/c/932/932/330/130/il/66d1a3/8789393707/il_800x800.8789393707_i4u1.jpg",
          width: 1000,
          height: 1000,
          alt: `${currentCat.name} Collection`,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  const categories = getAllCategories();
  const currentCat = categories.find((c) => c.slug === category);

  if (!currentCat) notFound();

  const products = getProductsByCategory(category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Category Hero Header */}
      <div className="text-center space-y-3 border-b border-[#EBE5DC] pb-10">
        <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#B89758] font-semibold">
          Curated Universe
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl text-[#121212] font-light">
          {currentCat.name}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#5A5651] max-w-lg mx-auto font-light leading-relaxed">
          {currentCat.count} handcrafted pieces available with exclusive 50% off boutique pricing.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
        <Link
          href="/#creations"
          className="px-4 py-2 border border-[#EBE5DC] text-xs font-sans uppercase tracking-luxury text-[#5A5651] hover:text-[#121212] transition-colors"
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={`px-4 py-2 text-xs font-sans uppercase tracking-luxury transition-all ${
              cat.slug === category
                ? "bg-[#121212] text-[#FAF8F5]"
                : "border border-[#EBE5DC] text-[#5A5651] hover:text-[#121212]"
            }`}
          >
            {cat.name} ({cat.count})
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
