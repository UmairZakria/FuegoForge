"use client";

import { useEffect, useState } from "react";
import { X, Lock, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import siteConfig from "@/lib/site-config";

const PROMO_CFG = siteConfig?.promoModal || {};
const STORAGE_KEY = "ff_promo_dismissed_v1";
const DISMISS_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const ETSY_URL = PROMO_CFG.ctaHref || "https://fuegoforge.etsy.com?ref=share_and_save";
const PROMO_IMAGE =
  PROMO_CFG.image ||
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85";

function wasRecentlyDismissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return !Number.isNaN(ts) && Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore storage errors
  }
}

export default function PromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Trigger after preloader completes: configurable delay, 35% scroll, or desktop exit-intent
  useEffect(() => {
    if (PROMO_CFG.enabled === false) return;
    if (wasRecentlyDismissed()) return;

    let triggered = false;
    let delayTimer = null;

    const openOnce = () => {
      if (triggered || wasRecentlyDismissed()) return;
      triggered = true;
      cleanupTriggers();
      setIsOpen(true);
    };

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 200 && window.scrollY / scrollable >= 0.35) {
        openOnce();
      }
    };

    const handleExitIntent = (e) => {
      if (e.clientY <= 4 && e.relatedTarget === null) {
        openOnce();
      }
    };

    const cleanupTriggers = () => {
      if (delayTimer) window.clearTimeout(delayTimer);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseout", handleExitIntent);
    };

    const armTriggers = () => {
      const delayMs = Math.max(1, Number(PROMO_CFG.delaySeconds) || 9) * 1000;
      delayTimer = window.setTimeout(openOnce, delayMs);
      window.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("mouseout", handleExitIntent);
    };

    if (window.__ffPreloaderDone) {
      armTriggers();
    } else {
      window.addEventListener("ff:preloader-done", armTriggers, { once: true });
    }

    return () => {
      window.removeEventListener("ff:preloader-done", armTriggers);
      cleanupTriggers();
    };
  }, []);

  // Lock page & Lenis scroll while modal is open + close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.__ffLenis?.stop();

    const handleKey = (e) => {
      if (e.key === "Escape") {
        markDismissed();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      window.__ffLenis?.start();
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const handleClose = () => {
    markDismissed();
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    markDismissed();
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ff-promo-heading"
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Dimmed Blurred Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-[#0E0C0B]/65 backdrop-blur-xs"
      />

      {/* Split-Screen Editorial Modal Card */}
      <div
        className={`relative z-10 w-full max-w-[760px] rounded-[16px] overflow-hidden bg-[#171515] border border-white/12 shadow-[0_32px_90px_rgba(0,0,0,0.55)] grid grid-cols-1 md:grid-cols-12 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Top-Right Circular Close Button */}
        <button
          type="button"
          onClick={handleClose}
          tabIndex={isOpen ? 0 : -1}
          aria-label="Close offer popup"
          className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-[#9E2A30] backdrop-blur-md border border-white/25 text-white flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Brand Offer & Email Capture */}
        <div className="md:col-span-6 p-6 sm:p-8 lg:p-9 flex flex-col justify-center text-center space-y-5 order-2 md:order-1">
          <span className="font-cinzel-decorative uppercase tracking-[0.22em] text-xs text-[#FAF7F2]/90">
            {PROMO_CFG.brandLabel || "Fuego Forge"}
          </span>

          <div className="space-y-2">
            <p className="text-[11px] font-poppins uppercase tracking-[0.22em] text-[#E0535C] font-medium">
              {PROMO_CFG.eyebrow || "Atelier Privilege"}
            </p>
            <h2
              id="ff-promo-heading"
              className="font-editorial text-[clamp(2.5rem,5vw,3.6rem)] leading-[0.94] font-light text-white"
            >
              {PROMO_CFG.headline || "50% Off"}{" "}
              <span className="italic font-normal text-[#F3ECC8]">
                {PROMO_CFG.headlineAccent || "Sitewide"}
              </span>
            </h2>
            <p className="text-xs font-poppins font-light text-white/70 leading-relaxed max-w-[28ch] mx-auto pt-1">
              {PROMO_CFG.description ||
                "Handcrafted fine jewelry with complimentary tracked worldwide delivery on Etsy."}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 pt-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#9E2A30]/20 border border-[#D9464F]/50 text-[#E0535C] mx-auto">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs font-poppins text-white/85 leading-relaxed">
                You&apos;re on the Fuego Forge private list. Your privilege is live now.
              </p>
              <a
                href={ETSY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="w-full py-3.5 px-6 rounded-full bg-[#9E2A30] hover:bg-[#FAF7F2] text-white hover:text-[#171515] text-xs font-poppins font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
              >
                <span>{PROMO_CFG.ctaLabel || "Shop 50% Off on Etsy"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                tabIndex={isOpen ? 0 : -1}
                className="w-full px-4 py-3 rounded-full bg-[#FAF7F2] text-[#171515] placeholder:text-[#8E867E] text-xs font-poppins focus:outline-none focus:ring-2 focus:ring-[#D9464F]"
              />

              <p className="inline-flex items-center justify-center gap-1.5 text-[10px] font-poppins text-white/50">
                <Lock className="w-3 h-3 text-[#D9464F]" />
                <span>Private atelier drops only. We respect your privacy.</span>
              </p>

              <button
                type="submit"
                tabIndex={isOpen ? 0 : -1}
                className="w-full py-3.5 px-6 rounded-full bg-[#9E2A30] hover:bg-[#FAF7F2] text-white hover:text-[#171515] text-xs font-poppins font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Unlock 50% Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-center gap-4 pt-1">
                <a
                  href={ETSY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  tabIndex={isOpen ? 0 : -1}
                  className="text-[11px] font-poppins text-[#F3ECC8]/85 hover:text-white underline underline-offset-4 transition-colors"
                >
                  Shop Sale Directly
                </a>
                <span className="text-white/25 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={handleClose}
                  tabIndex={isOpen ? 0 : -1}
                  className="text-[11px] font-poppins text-white/55 hover:text-white transition-colors cursor-pointer"
                >
                  No, thanks
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Editorial Campaign Photo (Top banner on mobile, full-height split on desktop) */}
        <div className="md:col-span-6 relative h-44 sm:h-52 md:h-auto md:min-h-[420px] order-1 md:order-2 overflow-hidden bg-[#1F1B1A]">
          <img
            src={PROMO_IMAGE}
            alt="Fuego Forge Handcrafted Gold Jewelry"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171515]/60 via-transparent to-black/25 md:bg-gradient-to-r md:from-[#171515]/45 md:via-transparent md:to-transparent" />
        </div>
      </div>
    </div>
  );
}
