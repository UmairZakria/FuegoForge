"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/WishlistProvider";

export default function WishlistButton({ product }) {
  const { isWishlisted, toggleItem } = useWishlist();
  const saved = isWishlisted(product.id);

  return (
    <button
      type="button"
      onClick={() => toggleItem(product)}
      aria-label={saved ? "Remove from saved pieces" : "Save to favorites"}
      title={saved ? "Saved to favorites" : "Add to favorites"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-poppins font-medium transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
        saved
          ? "bg-[#9E2A30] border-[#9E2A30] text-white"
          : "bg-[var(--bg-primary)] border-[var(--border-strong)] text-[#171515] hover:border-[#9E2A30] hover:text-[#9E2A30]"
      }`}
    >
      <Heart className={`w-3.5 h-3.5 transition-transform ${saved ? "fill-current scale-105" : ""}`} />
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}

