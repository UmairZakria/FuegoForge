"use client";

import { useState } from "react";

export default function ProductGallery({ images = [], title = "" }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeImage = images[selectedIdx] || images[0] || "";

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#F3EFEA] border border-[#EBE5DC] flex items-center justify-center text-[#8E8A83] text-xs font-sans uppercase tracking-luxury">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Large Zoom Viewport */}
      <div className="relative aspect-square overflow-hidden bg-[#F3EFEA] border border-[#EBE5DC]">
        <img
          src={activeImage}
          alt={`${title} - view ${selectedIdx + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-out"
        />
        <span className="absolute bottom-3 left-3 bg-[#121212]/80 text-[#FAF8F5] text-[10px] font-sans tracking-luxury uppercase px-2 py-0.5 backdrop-blur-xs">
          {selectedIdx + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-20 h-20 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                selectedIdx === idx
                  ? "border-[#121212] ring-1 ring-[#121212]"
                  : "border-[#EBE5DC] opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
