"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { useWishlist } from "@/components/WishlistProvider";

function getCardImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  return url.replace("/il_fullxfull.", "/il_600xN.").replace("/il_800x800.", "/il_600xN.");
}

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
  const thumbMain = getCardImageUrl(mainImage);
  const thumbSecondary = images.length > 1 ? getCardImageUrl(images[1]) : "";

  const { isWishlisted, toggleItem } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const [isHovered, setIsHovered] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [secondaryReady, setSecondaryReady] = useState(false);
  const hoverTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (hasVideo) {
      hoverTimerRef.current = window.setTimeout(() => {
        setPlayVideo(true);
      }, 280);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setPlayVideo(false);
    setVideoReady(false);
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tall Editorial Image / Hover-Intent Video Frame */}
      <div className="relative aspect-[4/5] rounded-[12px] overflow-hidden bg-[var(--bg-secondary)]">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          {thumbMain ? (
            <>
              {/* Base Main Photo stays always visible underneath so there is ZERO blank flash */}
              <img
                src={thumbMain}
                alt={title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              {playVideo && hasVideo && (
                <video
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={() => setVideoReady(true)}
                  onPlaying={() => setVideoReady(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                    videoReady ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
              {isHovered && !hasVideo && thumbSecondary && (
                <img
                  src={thumbSecondary}
                  alt={`${title} alternate view`}
                  decoding="async"
                  onLoad={() => setSecondaryReady(true)}
                  className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-300 ${
                    secondaryReady ? "opacity-100" : "opacity-0"
                  }`}
                />
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
            toggleItem(product);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250 ease-out active:scale-90 cursor-pointer ${
            wishlisted
              ? "bg-[#9E2A30] text-white opacity-100 scale-105 shadow-sm"
              : "bg-white/90 text-[#171515] opacity-0 group-hover:opacity-100 hover:bg-[#171515] hover:text-white hover:scale-105 shadow-xs"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Bottom Quick-Action Slide-Up Bar */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+16px)] group-hover:translate-y-0 transition-transform duration-300 ease-out flex items-center gap-2">
          <Link
            href={`/product/${slug}`}
            className="flex-1 py-2.5 px-4 rounded-full bg-white/95 hover:bg-[#171515] text-[#171515] hover:text-white text-xs font-poppins font-medium text-center transition-colors shadow-sm"
          >
            View Piece
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
