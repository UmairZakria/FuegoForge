"use client";

import { useState, useMemo, useRef } from "react";
import { Play } from "lucide-react";
import DepthHoverImage from "@/components/DepthHoverImage";

export default function ProductGallery({ images = [], videoUrl = "", title = "" }) {
  const mediaItems = useMemo(() => {
    const items = images.map((src) => ({ type: "image", src }));
    if (videoUrl && videoUrl.trim()) {
      const videoEntry = {
        type: "video",
        src: videoUrl.trim(),
        poster: images[0] || "",
      };
      if (items.length > 0) {
        items.splice(1, 0, videoEntry);
      } else {
        items.push(videoEntry);
      }
    }
    return items;
  }, [images, videoUrl]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const mobileTrackRef = useRef(null);
  const activeItem = mediaItems[selectedIdx] || mediaItems[0] || null;

  const handleSelectThumbnail = (idx) => {
    setSelectedIdx(idx);
    const track = mobileTrackRef.current;
    if (track && track.clientWidth > 0) {
      track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
    }
  };

  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;
    if (!track || track.clientWidth === 0) return;
    const nextIdx = Math.round(track.scrollLeft / track.clientWidth);
    if (nextIdx !== selectedIdx && nextIdx >= 0 && nextIdx < mediaItems.length) {
      setSelectedIdx(nextIdx);
    }
  };

  if (!activeItem) {
    return (
      <div className="aspect-square bg-[var(--bg-secondary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] text-xs font-sans uppercase tracking-luxury">
        No Media Available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-[var(--grid-gap)] items-start">
      {/* Thumbnails: Horizontal on mobile, Clean Vertical Rail on md+ (No Scrollbar) */}
      {mediaItems.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full md:w-[clamp(64px,4.8vw,84px)] shrink-0 pb-1 md:pb-0">
          {mediaItems.map((item, idx) => (
            <button
              key={`${item.type}-${idx}`}
              type="button"
              onClick={() => handleSelectThumbnail(idx)}
              className={`relative w-16 h-16 md:w-full md:aspect-square shrink-0 overflow-hidden border transition-all cursor-pointer ${
                selectedIdx === idx
                  ? "border-[var(--text-primary)] ring-1 ring-[var(--text-primary)]"
                  : "border-[var(--border-light)] opacity-70 hover:opacity-100"
              }`}
              aria-label={item.type === "video" ? "Watch product video" : `View image ${idx + 1}`}
            >
              {item.type === "video" ? (
                <>
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={`${title} video thumbnail`}
                      className="w-full h-full object-cover brightness-75"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-dark)]" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-black/30 text-[#FAF7F2]">
                    <span className="w-6 h-6 rounded-full bg-[var(--burgundy)]/90 flex items-center justify-center shadow-sm">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </span>
                    <span className="text-[8px] font-poppins uppercase tracking-wider font-medium">
                      Video
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={item.src.replace("/il_fullxfull.", "/il_600xN.")}
                  alt={`Thumbnail ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Large Viewport: Swipeable Carousel on Mobile (< md), 3D Depth / Video on Desktop (md+) */}
      <div className="relative flex-1 w-full aspect-square overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-light)]">
        {/* Mobile Native Horizontal Swipe Track */}
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="md:hidden flex w-full h-full overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {mediaItems.map((item, idx) => (
            <div key={`slide-${item.type}-${idx}`} className="w-full h-full shrink-0 snap-center">
              {item.type === "video" ? (
                selectedIdx === idx ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    {item.poster && (
                      <img
                        src={item.poster}
                        alt={`${title} video preview`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover brightness-90"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-[var(--burgundy)]/90 text-white flex items-center justify-center shadow-md">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={item.src}
                  alt={`${title} - view ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop Viewport (unchanged: 3D depth hover on main image + video support) */}
        <div className="hidden md:block w-full h-full">
          {activeItem.type === "video" ? (
            <video
              key={activeItem.src}
              src={activeItem.src}
              poster={activeItem.poster}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          ) : selectedIdx === 0 ? (
            <DepthHoverImage
              src={activeItem.src}
              alt={`${title} - view ${selectedIdx + 1}`}
              className="w-full h-full object-cover transition-all duration-500 ease-out"
            />
          ) : (
            <img
              src={activeItem.src}
              alt={`${title} - view ${selectedIdx + 1}`}
              className="w-full h-full object-cover transition-all duration-500 ease-out"
            />
          )}
        </div>

        <span className="absolute bottom-3 left-3 bg-[var(--bg-dark)]/80 text-[var(--bg-primary)] text-[10px] font-sans tracking-luxury uppercase px-2.5 py-1 backdrop-blur-xs pointer-events-none">
          {activeItem.type === "video" ? "Video • " : ""}
          {selectedIdx + 1} / {mediaItems.length}
        </span>
      </div>
    </div>
  );
}
