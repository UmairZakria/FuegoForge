"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import SmartVideo from "@/components/SmartVideo";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative z-10 min-h-[88vh] flex flex-col justify-between bg-[#141110] text-[#FAF7F2] overflow-hidden border-t border-[var(--border-dark)]">
      {/* =====================================================================
          1. FULL-BLEED CINEMATIC BACKGROUND VIDEO (/Footer-BG.mp4)
         ===================================================================== */}
      <div className="absolute inset-0 select-none pointer-events-none">
        <SmartVideo
          src="/Footer-BG.mp4"
          preload="none"
          className="w-full h-full object-cover object-[58%_22%] scale-[1.01]"
        />
        {/* Directional Editorial Scrims: Preserves the model in center-right while grounding left & bottom text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#120F0E]/88 via-[#120F0E]/42 to-[#120F0E]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120F0E] via-[#120F0E]/55 to-transparent" />
      </div>

      {/* =====================================================================
          2. UPPER STAGE — ASYMMETRIC CAMPAIGN STATEMENT (Left Wall Space)
         ===================================================================== */}
      <div className="layout-shell relative z-10 pt-[clamp(56px,6.5vw,112px)] pb-[clamp(36px,4vw,64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[var(--block-gap)] items-end">
          {/* Left 7 Columns: Bold Editorial Headline + Frosted Glass Dispatch Card */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-editorial text-[clamp(2.5rem,5vw,5.6rem)] font-light uppercase leading-[0.94] tracking-[-0.02em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              Forged in <br />
              <span className="italic font-normal text-[#D9464F]">Shadow &amp; Gold.</span>
            </h2>

            <p className="font-poppins text-[length:var(--text-sm)] text-white/90 font-normal max-w-md leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
              Receive private invitations to small-batch drops, archival releases, and our direct 50% off boutique privilege on Etsy.
            </p>

            {/* Frosted Glass Newsletter Bar */}
            <div className="max-w-lg pt-1">
              {subscribed ? (
                <div className="p-4 rounded-[10px] border border-[#D9464F]/60 bg-[#171515]/80 backdrop-blur-md text-xs font-poppins text-white">
                  Thank you. You have been added to the FuegoForge private list.
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className="p-1.5 rounded-[10px] bg-[#141110]/75 backdrop-blur-md border border-white/25 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for private access..."
                    className="flex-1 bg-transparent px-4 py-2.5 text-xs font-poppins text-white placeholder:text-white/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[7px] bg-[#9E2A30] hover:bg-white hover:text-[#171515] text-white text-[11px] font-poppins font-medium uppercase tracking-[0.18em] transition-colors cursor-pointer shrink-0"
                  >
                    <span>Join Atelier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right 5 Columns: Open Frame for Video Subject + Floating Boutique Card */}
          <div className="lg:col-span-5 flex lg:justify-end">
            <div className="p-5 sm:p-6 rounded-[12px] bg-[#141110]/75 backdrop-blur-md border border-white/20 max-w-xs w-full space-y-4">
              <p className="font-poppins text-sm sm:text-base font-normal text-white leading-relaxed">
                Direct from our studio workbench to your skin.
              </p>
              <a
                href="https://fuegoforge.etsy.com?ref=share_and_save"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-[6px] bg-white hover:bg-[#9E2A30] text-[#171515] hover:text-white text-[11px] font-poppins font-semibold uppercase  transition-colors"
              >
                <span>Shop Etsy </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          3. LOWER STAGE — ARCHITECTURAL DIRECTORY & MONUMENTAL WORDMARK
         ===================================================================== */}
      <div className="layout-shell relative z-10 pb-[clamp(24px,2.5vw,44px)] space-y-[clamp(28px,3vw,48px)]">
        {/* Directory Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-[var(--block-gap)] py-[clamp(28px,3vw,48px)] border-y border-white/20">
          {/* Philosophy */}
          <div className="lg:col-span-4 space-y-3">
            <p className="font-poppins text-sm sm:text-base text-white font-medium max-w-sm leading-relaxed">
              &ldquo;Not for someday. Handcrafted fine jewelry forged to live in.&rdquo;
            </p>
            <p className="text-xs text-white/80 font-poppins leading-relaxed max-w-sm font-light">
              Every piece is individually sculpted and finished by hand with worldwide tracked delivery and official Etsy buyer protection.
            </p>
          </div>

          {/* Disciplines */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-poppins uppercase tracking-[0.22em] text-[#E0535C] font-semibold">
              Disciplines
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-poppins text-white/90 font-normal">
              <li>
                <Link href="/category/earrings" className="hover:text-[#E0535C] transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="hover:text-[#E0535C] transition-colors">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link href="/category/hair-accessories" className="hover:text-[#E0535C] transition-colors">
                  Hairpins
                </Link>
              </li>
              <li>
                <Link href="/category/bracelets" className="hover:text-[#E0535C] transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/category/masquerade-masks" className="hover:text-[#E0535C] transition-colors">
                  Masquerade
                </Link>
              </li>
              <li>
                <Link href="/category/jewelry-boxes" className="hover:text-[#E0535C] transition-colors">
                  Ring Boxes
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-poppins uppercase tracking-[0.22em] text-[#E0535C] font-semibold">
              Atelier Guarantees
            </h3>
            <ul className="space-y-2 text-xs font-poppins text-white/90 font-normal">
              <li>Complimentary Tracked Delivery</li>
              <li>30-Day Verified Etsy Protection</li>
              <li>Tarnish-Resistant Artisan Finish</li>
              <li>Complimentary Luxury Gift Box</li>
            </ul>
          </div>

          {/* Official Channels */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-poppins uppercase tracking-[0.22em] text-[#E0535C] font-semibold">
              Channels
            </h3>
            <ul className="space-y-2.5 text-xs font-poppins text-white/90 font-normal">
              <li>
                <a
                  href="https://fuegoforge.etsy.com?ref=share_and_save"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#E0535C] transition-colors"
                >
                  <span>Etsy Storefront</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com/fuegoforge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-[#E0535C] transition-colors"
                >
                  <span>Pinterest</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/#creations" className="hover:text-[#E0535C] transition-colors">
                  Full Archive →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Monumental Edge-to-Edge Wordmark + Bottom Copyright */}
        <div className="space-y-4">
          <div className="w-full overflow-hidden text-center select-none pointer-events-none">
            <span className="block font-cinzel-decorative text-[clamp(2.35rem,8.6vw,11rem)] leading-[0.86] tracking-[0.06em] uppercase text-white">
              Fuego Forge
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-[11px] text-white/75 font-poppins tracking-[0.16em] uppercase">
            <p>© 2026 FUEGO FORGE. All Rights Reserved.</p>
            <p>Contemporary Joaillerie • Handcrafted to Live In</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
