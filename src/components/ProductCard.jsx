import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

export default function ProductCard({ product }) {
  const { slug, title, categoryName, price, originalPrice, discount, mainImage } = product;

  return (
    <article className="group flex flex-col bg-[#FFFFFF] border border-[#EBE5DC] overflow-hidden hover:border-[#121212] transition-all duration-300">
      <Link href={`/product/${slug}`} className="relative aspect-square overflow-hidden bg-[#F3EFEA] block">
        {mainImage ? (
          <img
            src={mainImage}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8E8A83] text-xs font-sans uppercase tracking-luxury">
            Fuego Forge Piece
          </div>
        )}

        {/* 50% Off Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-[#121212] text-[#FAF8F5] text-[10px] font-sans font-semibold tracking-luxury uppercase px-2.5 py-1">
            {discount}
          </div>
        )}

        {/* Rating overlay */}
        <div className="absolute bottom-3 right-3 bg-[#FAF8F5]/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-sans font-medium flex items-center gap-1 text-[#121212] border border-[#EBE5DC]">
          <Star className="w-2.5 h-2.5 fill-[#B89758] text-[#B89758]" />
          <span>5.0</span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-sans uppercase tracking-luxury text-[#B89758] block">
            {categoryName}
          </span>
          <h3 className="font-editorial text-lg text-[#121212] line-clamp-2 leading-snug group-hover:text-[#B89758] transition-colors">
            <Link href={`/product/${slug}`}>{title}</Link>
          </h3>
        </div>

        <div className="pt-3 border-t border-[#F3EFEA] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-sans font-medium text-[#121212]">
              ${Number(price).toFixed(2)}
            </span>
            {originalPrice > price && (
              <span className="text-xs font-sans text-[#8E8A83] line-through">
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-1 text-[11px] font-sans uppercase tracking-luxury text-[#121212] group-hover:translate-x-0.5 transition-transform font-medium"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
