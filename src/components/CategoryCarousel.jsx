"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Parallax from "@/components/Parallax";
import FluidHoverImage from "@/components/FluidHoverImage";

export default function CategoryCarousel({ categories = [] }) {
  const trackRef = useRef(null);

  const scrollByCard = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.65, 280);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section
      id="season"
      className="layout-shell pb-[var(--section-gap)] space-y-[clamp(24px,2.4vw,44px)]"
    >
      {/* Top Header Split */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="font-editorial type-h1 font-light uppercase text-[var(--text-primary)] tracking-[-0.01em] leading-[0.98]">
          The New Season <br />
          Collection
        </h2>

        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-4 max-w-xs">
          <p className="font-poppins text-[length:var(--text-sm)] text-[var(--text-secondary)] font-light leading-relaxed md:text-right">
            Pieces defined by clean lines, sculptural details, and a refined sense of modern luxury.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous collections"
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-dark)] hover:text-[var(--bg-primary)] hover:border-[var(--bg-dark)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next collections"
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-dark)] hover:text-[var(--bg-primary)] hover:border-[var(--bg-dark)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Minimalist Cinematic Collection Carousel */}
      <div
        ref={trackRef}
        className="flex gap-[var(--grid-gap)] overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group relative shrink-0 w-[80%] sm:w-[48%] lg:w-[32%] xl:w-[27.5%] aspect-[4/5] rounded-[14px] overflow-hidden snap-start bg-[#0E0D0D]"
          >
            {/* Full-Bleed Collection Photo with Lusion Liquid Hover */}
            {cat.sampleImage ? (
              <Parallax speed={0.05} scale={1.06} className="absolute inset-0 w-full h-full">
                <FluidHoverImage
                  src={cat.sampleImage.replace("/il_fullxfull.", "/il_600xN.")}
                  alt={`${cat.name} Collection`}
                  className="w-full h-full"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </Parallax>
            ) : (
              <div className="absolute inset-0 bg-[#141313]" />
            )}

            {/* Pure Cinematic Black Bottom Fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 via-45% to-transparent transition-opacity duration-500 group-hover:opacity-95 pointer-events-none" />

            {/* Minimalist Bottom Typography */}
            <div className="relative z-10 h-full p-6 sm:p-7 flex flex-col justify-end pointer-events-none">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-poppins font-medium uppercase tracking-[0.24em] text-white/60">
                    {String(idx + 1).padStart(2, "0")} — {cat.count}{" "}
                    {cat.count === 1 ? "Piece" : "Pieces"}
                  </span>
                  <h3 className="font-editorial text-[clamp(1.85rem,2.5vw,2.6rem)] font-medium uppercase leading-[0.95] tracking-[-0.01em] text-white">
                    {cat.name}
                  </h3>
                </div>

                <ArrowUpRight className="w-5 h-5 shrink-0 text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 mb-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
