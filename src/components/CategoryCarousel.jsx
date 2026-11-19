"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Parallax from "@/components/Parallax";

export default function CategoryCarousel({ categories = [] }) {
  const trackRef = useRef(null);

  const scrollByCard = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.65, 280);
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="season" className="layout-shell  pb-[var(--section-gap)] space-y-[clamp(24px,2.4vw,44px)]">
      {/* Top Header Split */}
      <div className="flex flex-col md:flex-row  md:items-center justify-between gap-6">
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
              aria-label="Previous categories"
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-dark)] hover:text-[var(--bg-primary)] hover:border-[var(--bg-dark)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next categories"
              className="w-9 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] hover:bg-[var(--bg-dark)] hover:text-[var(--bg-primary)] hover:border-[var(--bg-dark)] text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category Carousel Track */}
      <div
        ref={trackRef}
        className="flex gap-[var(--grid-gap)] overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat, idx) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group shrink-0 w-[76%] sm:w-[46%] lg:w-[31.5%] xl:w-[27%] snap-start flex flex-col gap-3"
          >
            {/* Clean Image Frame (No Overlay Text) */}
            <div className="relative aspect-square rounded-[12px] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-light)]">
              {cat.sampleImage ? (
                <Parallax speed={0.05} scale={1.06} className="w-full h-full">
                  <img
                    src={cat.sampleImage.replace("/il_fullxfull.", "/il_600xN.")}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </Parallax>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-poppins text-[var(--text-muted)] uppercase">
                  {cat.name}
                </div>
              )}
            </div>

            {/* Minimal Right-Aligned Index & Category Name Below Image */}
            <div className="flex items-center justify-end gap-1.5 text-[11px] font-title font-medium uppercase tracking-[0.14em] text-[var(--burgundy)] group-hover:text-[var(--text-primary)] transition-colors">
              <span>
                ^{String(idx + 1).padStart(2, "0")} {cat.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

