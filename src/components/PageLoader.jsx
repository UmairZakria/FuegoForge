"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PRIMARY_HERO_SRC = "/hero-editorial.webp";

const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

/**
 * Streams a critical image via Fetch + ReadableStream so progress updates
 * smoothly byte-by-byte even on throttled 3G networks (never stuck at 00%).
 * Decodes the image on GPU before resolving.
 */
async function streamAndDecodeImage(src, onFraction) {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) throw new Error("fetch failed");

    const total = Number(res.headers.get("content-length")) || 0;
    if (res.body && total > 0) {
      const reader = res.body.getReader();
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        onFraction(Math.min(loaded / total, 1));
      }
    } else {
      await res.blob();
      onFraction(1);
    }
  } catch {
    onFraction(1);
  }

  // Ensure the browser has decoded the cached image ready for instant paint
  await new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    const done = () => {
      if (img.decode) {
        img.decode().catch(() => {}).finally(resolve);
      } else {
        resolve();
      }
    };
    img.onload = done;
    img.onerror = resolve;
    img.src = src;
    if (img.complete) done();
  });
}

function waitForHeroReady(timeoutMs = 12000) {
  const hasHero = Boolean(document.querySelector("[data-hero-portrait]"));
  if (!hasHero || window.__ffHeroReady) return Promise.resolve();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.removeEventListener("ff:hero-ready", finish);
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, timeoutMs);
    window.addEventListener("ff:hero-ready", finish, { once: true });
  });
}

export default function PageLoader() {
  const [count, setCount] = useState(0);
  const [stageLabel, setStageLabel] = useState("Preparing Atelier");
  const [mounted, setMounted] = useState(true);

  const rootRef = useRef(null);
  const contentRef = useRef(null);
  const curvePathRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    // Only run once per session so back/forth navigation stays instant
    try {
      if (sessionStorage.getItem("ff_lusion_loaded") === "1") {
        setMounted(false);
        window.__ffPreloaderDone = true;
        window.__ffLenis?.start();
        window.dispatchEvent(new CustomEvent("ff:preloader-done"));
        return;
      }
    } catch {
      // ignore storage errors
    }

    // 1. Complete scroll lock (HTML + Body + Lenis + Wheel/Touch/Keyboard)
    window.scrollTo(0, 0);
    window.__ffLenis?.stop();

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevTouchAction = document.documentElement.style.touchAction;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";

    const preventScroll = (e) => e.preventDefault();
    const preventScrollKeys = (e) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
    window.addEventListener("keydown", preventScrollKeys, { passive: false });

    const unlockScroll = () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.touchAction = prevTouchAction;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", preventScrollKeys);
    };

    let cancelled = false;
    let revealed = false;

    // Real weighted progress buckets (sum = 100)
    const buckets = {
      fonts: 0, // max 20
      heroImage: 0, // max 55 (streamed byte-by-byte!)
      heroRender: 0, // max 25 (DOM/WebGL painted)
    };

    const displayObj = { value: 0 };
    let progressTween = null;

    const syncProgress = () => {
      if (cancelled || revealed) return;
      const total = Math.min(99, buckets.fonts + buckets.heroImage + buckets.heroRender);
      if (progressTween) progressTween.kill();
      progressTween = gsap.to(displayObj, {
        value: Math.max(displayObj.value, total),
        duration: 0.3,
        ease: "power2.out",
        onUpdate: () => {
          if (cancelled) return;
          const v = Math.round(displayObj.value);
          setCount(v);
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${displayObj.value / 100})`;
          }
        },
      });
    };

    const triggerReveal = () => {
      if (revealed || cancelled) return;
      revealed = true;
      if (progressTween) progressTween.kill();

      try {
        sessionStorage.setItem("ff_lusion_loaded", "1");
      } catch {
        // ignore
      }

      window.scrollTo(0, 0);
      setStageLabel("Entering Atelier");

      const tl = gsap.timeline({
        onComplete: () => {
          unlockScroll();
          window.__ffLenis?.start();
          if (!cancelled) setMounted(false);
        },
      });

      // 1. Finish counter smoothly to 100%
      tl.to(displayObj, {
        value: 100,
        duration: 0.35,
        ease: "power3.out",
        onUpdate: () => {
          if (cancelled) return;
          const v = Math.round(displayObj.value);
          setCount(v);
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${displayObj.value / 100})`;
          }
        },
      });

      // 2. Lift preloader typography & emblem out
      tl.to(
        contentRef.current,
        {
          y: -44,
          opacity: 0,
          duration: 0.4,
          ease: "power3.in",
        },
        "+=0.05"
      );

      // 3. Fire Hero GSAP entrance right as the curved curtain sweeps upward
      tl.add(() => {
        window.__ffPreloaderDone = true;
        window.dispatchEvent(new CustomEvent("ff:preloader-done"));
      }, "-=0.1");

      // 4. Lusion-style curved SVG veil morph & upward sweep
      if (curvePathRef.current) {
        tl.to(
          curvePathRef.current,
          {
            attr: { d: "M0 0 L100 0 L100 100 Q50 72 0 100 Z" },
            duration: 0.42,
            ease: "power2.in",
          },
          "-=0.08"
        ).to(
          curvePathRef.current,
          {
            attr: { d: "M0 0 L100 0 L100 0 Q50 0 0 0 Z" },
            duration: 0.62,
            ease: "power4.out",
          },
          "-=0.04"
        );
      } else {
        tl.to(rootRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "power4.inOut",
        });
      }
    };

    const isHome = Boolean(document.querySelector("[data-hero-portrait]"));

    // Task 1: Typography ready (20%)
    const fontsTask = (
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve()
    ).then(() => {
      buckets.fonts = 20;
      if (!cancelled && isHome && buckets.heroImage < 55) {
        setStageLabel("Loading Editorial Portrait");
      }
      syncProgress();
    });

    // Task 2: Stream primary Hero WebP byte-by-byte + GPU decode (55%)
    const heroImageTask = isHome
      ? streamAndDecodeImage(PRIMARY_HERO_SRC, (fraction) => {
          buckets.heroImage = Math.round(fraction * 55);
          if (!cancelled && fraction > 0.05 && fraction < 1) {
            setStageLabel("Loading Editorial Portrait");
          }
          syncProgress();
        })
      : Promise.resolve().then(() => {
          buckets.heroImage = 55;
          syncProgress();
        });

    // Task 3: Hero DOM/WebGL first frame painted (25%)
    const heroRenderTask = waitForHeroReady(12000).then(() => {
      buckets.heroRender = 25;
      if (!cancelled) setStageLabel("Entering Atelier");
      syncProgress();
    });

    // Wait for ALL 3 real tasks (+ brief 500ms floor so fast cache still feels intentional)
    const minGrace = new Promise((r) => window.setTimeout(r, 500));
    const hardFailsafe = window.setTimeout(triggerReveal, 14000);

    Promise.all([fontsTask, heroImageTask, heroRenderTask, minGrace]).then(triggerReveal);

    return () => {
      cancelled = true;
      if (progressTween) progressTween.kill();
      window.clearTimeout(hardFailsafe);
      unlockScroll();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Fuego Forge Atelier"
      className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden touch-none overscroll-none"
    >
      {/* Curved Lusion-Style SVG Curtain */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
      >
        <path
          ref={curvePathRef}
          d="M0 0 L100 0 L100 100 Q50 100 0 100 Z"
          fill="#110F0E"
        />
      </svg>

      {/* Architectural Preloader Content */}
      <div
        ref={contentRef}
        className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-[#FAF7F2]"
      >
        {/* Top Micro Row */}
        <div className="flex items-center justify-between text-[11px] font-poppins uppercase tracking-[0.22em] text-white/55">
          <span className="font-cinzel-decorative text-white/90 tracking-[0.2em]">
            Fuego Forge
          </span>
          <span>Joaillerie &amp; Artisanat</span>
        </div>

        {/* Center Sculptural Rotating Atelier Emblem + Live Stage Label */}
        <div className="flex flex-col items-center justify-center gap-6 my-auto">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <span className="absolute -inset-6 rounded-full bg-[#9E2A30]/15 blur-2xl animate-pulse" />
            <span className="absolute inset-0 rounded-full border border-white/15 animate-[spin_9s_linear_infinite]" />
            <span className="absolute inset-2.5 rotate-45 border border-[#D9464F]/75 animate-[spin_6s_linear_infinite_reverse]" />
            <span className="w-2 h-2 rounded-full bg-[#D9464F] shadow-[0_0_12px_rgba(217,70,79,0.85)]" />
          </div>
          <span className="text-[11px] font-poppins uppercase tracking-[0.26em] text-white/60 transition-opacity duration-300">
            {stageLabel}
          </span>
        </div>

        {/* Bottom Giant Lusion-Style Counter & Hairline Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <span className="font-editorial text-[clamp(4.2rem,11vw,10.5rem)] leading-[0.82] font-light tracking-[-0.04em] tabular-nums text-white">
              {String(count).padStart(2, "0")}
              <span className="text-[0.35em] text-[#D9464F] align-top ml-1">%</span>
            </span>

            <p className="hidden sm:block text-right text-xs font-poppins font-light text-white/50 max-w-[26ch] leading-relaxed pb-2">
              Handcrafted fine jewelry.
              <br />
              Forged to live in.
            </p>
          </div>

          <div className="w-full h-[1px] bg-white/15 overflow-hidden">
            <div
              ref={barRef}
              className="w-full h-full bg-[#D9464F] origin-left"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
