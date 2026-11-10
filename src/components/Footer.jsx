import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-[#FAF8F5] pt-16 pb-12 border-t border-[#252525]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-[#2B2927]">
          {/* Brand Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-brand text-2xl tracking-[0.25em] text-[#FAF8F5] uppercase">
              Fuego Forge
            </h3>
            <p className="font-editorial italic text-lg text-[#B89758] font-light max-w-md">
              “Fine handcrafted jewelry celebrating circular luxury, timeless heirlooms, and authentic artisan craftsmanship.”
            </p>
            <p className="text-xs text-[#8E8A83] font-sans leading-relaxed max-w-md">
              Every creation is individually designed and finished by hand. Certified secure checkout and direct buyer protection provided exclusively through our verified Etsy boutique.
            </p>
          </div>

          {/* Quick Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-luxury text-[#B89758] font-semibold">
              Collections
            </h4>
            <ul className="space-y-2 text-xs font-sans uppercase tracking-editorial text-[#C9C5BF]">
              <li>
                <Link href="/category/hair-accessories" className="hover:text-[#FAF8F5] transition-colors">
                  Hairpins & Clips
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="hover:text-[#FAF8F5] transition-colors">
                  Earrings & Huggies
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="hover:text-[#FAF8F5] transition-colors">
                  Pendants & Necklaces
                </Link>
              </li>
              <li>
                <Link href="/category/fine-jewelry" className="hover:text-[#FAF8F5] transition-colors">
                  Artisan Rings & Bangles
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Shop & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-sans uppercase tracking-luxury text-[#B89758] font-semibold">
              Etsy Boutique
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#C9C5BF]">
              <li>• Star Seller 5.0 Rating</li>
              <li>• Free Tracked Shipping</li>
              <li>• 100% Handcrafted Guarantee</li>
              <li className="pt-2">
                <a
                  href="https://fuegoforge.etsy.com?ref=share_and_save"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#B89758] hover:underline uppercase tracking-luxury font-medium"
                >
                  <span>Shop Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6E6A64] font-sans tracking-luxury uppercase">
          <p>© 2026 FUEGO FORGE. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0">SSG Powered • High-Performance E-Commerce</p>
        </div>
      </div>
    </footer>
  );
}
