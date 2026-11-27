import { ArrowUpRight } from "lucide-react";
import FluidHoverImage from "@/components/FluidHoverImage";
import siteConfig from "@/lib/site-config";

const DEFAULT_PORTRAIT_IMAGE =
  "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1400&q=82";

export default function SplitPortraitGrid() {
  const sp = siteConfig?.splitPortrait || {};
  const portraitImage = sp.image || DEFAULT_PORTRAIT_IMAGE;

  const tiles = Array.from({ length: 16 }, (_, idx) => ({
    row: Math.floor(idx / 4),
    col: idx % 4,
    idx,
  }));

  return (
    <section className="hidden md:block layout-shell pb-[var(--section-gap)]">
      <div className="relative w-full aspect-square overflow-hidden ">
        {/* Single Optimized Image Layer with Lusion Liquid Hover */}
        <FluidHoverImage
          src={portraitImage}
          alt="Fuego Forge Editorial Portrait"
          className="absolute inset-0 w-full h-full select-none"
          strength={0.32}
        />

        {/* 4x4 Rounded-Window Cutout Grid Mask */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {tiles.map(({ row, col, idx }) => (
            <div key={idx} className="relative overflow-hidden p-[clamp(3px,0.35vw,7px)]">
              <div
                className="w-full h-full rounded-[10px] relative"
                style={{ boxShadow: "0 0 0 24px var(--bg-primary)" }}
              >
                {(row === 2 || row === 3) && (col === 2 || col === 3) && (
                  <div className="absolute inset-0 rounded-[10px] bg-[#171515]/22" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Overlaid Editorial Headline & CTA in Lower-Right Quadrant */}
        <div className="absolute left-[51.5%] top-[53%] right-[3%] z-10 space-y-3 sm:space-y-4 pointer-events-auto">
          <h2 className="font-editorial text-[clamp(1.35rem,4vw,3.55rem)] font-light text-[#FAF7F2] leading-[1.04] drop-shadow-[0_2px_14px_rgba(23,21,21,0.5)]">
            {sp.headlineLine1 || "Luxury That"} <br />
            {sp.headlineLine2 || "Moves With Every"} <br />
            {sp.headlineLine3 || "Journey."}
          </h2>

          <a
            href={sp.ctaHref || "#creations"}
            className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-[6px] bg-[#FAF7F2] hover:bg-[var(--burgundy)] text-[var(--text-primary)] hover:text-[#FAF7F2] text-xs font-poppins font-medium transition-colors shadow-sm"
          >
            <span>{sp.ctaLabel || "Shop Now"}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
