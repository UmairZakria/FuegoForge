"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";

export default function ProductCard({ product }) {
  const {
    slug,
    title,
    categoryName,
    price,
    originalPrice,
    mainImage,
    images = [],
    videoUrl = "",
    etsyUrl,
  } = product;

  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const secondaryImage = images.length > 1 ? images[1] : null;
  const [wishlisted, setWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tall Editorial Image / Hover Video Frame */}
      <div className="relative aspect-[4/5] rounded-[12px] overflow-hidden bg-[var(--bg-secondary)]">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          {mainImage ? (
            <>
              <img
                src={mainImage}
                alt={title}
                loading="lazy"
                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                  hasVideo || secondaryImage ? "group-hover:opacity-0" : ""
                }`}
              />
              {hasVideo && isHovered ? (
                <video
                  src={videoUrl}
                  poster={secondaryImage || mainImage}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                />
              ) : (
                secondaryImage && (
                  <img
                    src={secondaryImage}
                    alt={`${title} alternate view`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                )
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-xs font-poppins">
              Fuego Forge Piece
            </div>
          )}
        </Link>

        {/* Top-right Wishlist Micro-Interaction */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setWishlisted((prev) => !prev);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            wishlisted
              ? "bg-[#9E2A30] text-white scale-105"
              : "bg-white/90 text-[#171515] opacity-0 group-hover:opacity-100 hover:bg-[#171515] hover:text-white shadow-xs"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Bottom Quick-Action Slide-Up Bar (Clean, Tight Typography) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+16px)] group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center gap-2">
          <Link
            href={`/product/${slug}`}
            className="flex-1 py-2.5 px-4 rounded-full bg-white/95 hover:bg-[#171515] text-[#171515] hover:text-white text-xs font-poppins font-medium text-center transition-colors shadow-sm"
          >
            View Item
          </Link>
          {etsyUrl && (
            <a
              href={etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buy on Etsy"
              title="Buy on Etsy"
              className="py-2.5 px-3.5 rounded-full bg-[#F1641E] hover:bg-[#D75413] text-white text-xs font-poppins font-medium inline-flex items-center justify-center transition-colors shrink-0 shadow-sm"
            >
              <span>Etsy</span>
            </a>
          )}
        </div>
      </div>

      {/* Minimalist Editorial Metadata Below Image */}
      <div className="pt-3.5 pb-2 flex flex-col flex-1 justify-between gap-1.5 border-b border-[var(--border-light)]/80">
        <div className="space-y-1">
          <span className="text-[11px] font-poppins text-[#9E2A30] font-medium block">
            {categoryName}
          </span>

          <h3 className="font-title font-medium text-[clamp(0.94rem,0.98vw,1.08rem)] text-[#171515] line-clamp-1 leading-snug group-hover:text-[#9E2A30] transition-colors">
            <Link href={`/product/${slug}`}>{title}</Link>
          </h3>
        </div>

        <div className="flex items-baseline justify-between gap-2 pt-0.5">
          <div className="flex items-baseline gap-2">
            <span className="font-poppins font-semibold text-[clamp(0.95rem,0.98vw,1.1rem)] text-[#171515]">
              ${Number(price).toFixed(2)}
            </span>
            {originalPrice > price && (
              <span className="font-poppins text-xs text-[var(--text-muted)] line-through font-light">
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <Link
            href={`/product/${slug}`}
            className="inline-flex items-center gap-1 text-xs font-poppins text-[var(--text-secondary)] group-hover:text-[#9E2A30] transition-colors"
          >
            <span>Explore</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
