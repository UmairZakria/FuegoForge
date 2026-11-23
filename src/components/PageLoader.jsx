"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const PRIMARY_HERO_SRC = "/hero-editorial.webp";
const LOADER_BACKGROUNDS = [
  "/loader-bg.webp",
  "/loader-bg-2.webp",
  "/loader-bg-3.webp",
  "/loader-bg-4.webp",
];
const RING_RADIUS = 94;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

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
  const [mounted, setMounted] = useState(true);

  const rootRef = useRef(null);
  const bgRef = useRef(null);
  const bgImgRef = useRef(null);
  const curvePathRef = useRef(null);
  const ringWrapRef = useRef(null);
  const ringArcRef = useRef(null);

  useEffect(() => {
    // Pick a random loading background (avoiding immediate repeat across reloads)
    if (bgImgRef.current) {
      let idx = Math.floor(Math.random() * LOADER_BACKGROUNDS.length);
      try {
        const last = Number(sessionStorage.getItem("ff_last_loader_bg"));
        if (!Number.isNaN(last) && LOADER_BACKGROUNDS.length > 1 && idx === last) {
          idx = (idx + 1 + Math.floor(Math.random() * (LOADER_BACKGROUNDS.length - 1))) % LOADER_BACKGROUNDS.length;
        }
        sessionStorage.setItem("ff_last_loader_bg", String(idx));
      } catch {
        // ignore storage errors
      }
      bgImgRef.current.src = LOADER_BACKGROUNDS[idx];
    }

    // Complete scroll lock (HTML + Body + Lenis + Wheel/Touch/Keyboard)
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

    const buckets = {
      fonts: 0, // 20
      heroImage: 0, // 55 (streamed byte-by-byte)
      heroRender: 0, // 25
    };

    const displayObj = { value: 0 };
    let progressTween = null;

    const applyVisualProgress = (val) => {
      setCount(Math.round(val));
      if (ringArcRef.current) {
        const offset = RING_CIRCUMFERENCE * (1 - val / 100);
        ringArcRef.current.style.strokeDashoffset = String(offset);
      }
    };

    const syncProgress = () => {
      if (cancelled || revealed) return;
      const total = Math.min(96, buckets.fonts + buckets.heroImage + buckets.heroRender);
      if (progressTween) progressTween.kill();
      progressTween = gsap.to(displayObj, {
        value: Math.max(displayObj.value, total),
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (!cancelled) applyVisualProgress(displayObj.value);
        },
      });
    };

    const triggerReveal = () => {
      if (revealed || cancelled) return;
      revealed = true;
      if (progressTween) progressTween.kill();

      window.scrollTo(0, 0);

      const tl = gsap.timeline({
        onComplete: () => {
          unlockScroll();
          window.__ffLenis?.start();
          if (!cancelled) setMounted(false);
        },
      });

      // 1. Finish circular arc & counter smoothly to 100
      tl.to(displayObj, {
        value: 100,
        duration: 0.45,
        ease: "power3.out",
        onUpdate: () => {
          if (!cancelled) applyVisualProgress(displayObj.value);
        },
      });

      // 2. Fade & subtly scale out the minimalist ring
      tl.to(
        ringWrapRef.current,
        {
          scale: 0.94,
          opacity: 0,
          duration: 0.38,
          ease: "power3.in",
        },
        "+=0.06"
      );

      // 3. Fire Hero GSAP entrance right as the screen lifts
      tl.add(() => {
        window.__ffPreloaderDone = true;
        window.dispatchEvent(new CustomEvent("ff:preloader-done"));
      }, "-=0.1");

      // 4. Lusion-style curved center-arch curtain sweep on the solid photo background
      if (curvePathRef.current && bgRef.current) {
        tl.add(() => {
          if (bgRef.current) {
            bgRef.current.style.clipPath = "url(#ff-loader-curtain-clip)";
            bgRef.current.style.webkitClipPath = "url(#ff-loader-curtain-clip)";
          }
        }, "-=0.08")
          .to(
            curvePathRef.current,
            {
              attr: { d: "M0 0 L1 0 L1 1 Q0.5 0.68 0 1 Z" },
              duration: 0.44,
              ease: "power2.in",
            },
            "<"
          )
          .to(
            curvePathRef.current,
            {
              attr: { d: "M0 0 L1 0 L1 0 Q0.5 0 0 0 Z" },
              duration: 0.65,
              ease: "power4.out",
            },
            "-=0.04"
          );
      } else {
        tl.to(
          rootRef.current,
          {
            yPercent: -100,
            duration: 0.85,
            ease: "power4.inOut",
          },
          "-=0.06"
        );
      }
    };

    const isHome = Boolean(document.querySelector("[data-hero-portrait]"));

    const fontsTask = (
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve()
    ).then(() => {
      buckets.fonts = 20;
      syncProgress();
    });

    const heroImageTask = isHome
      ? streamAndDecodeImage(PRIMARY_HERO_SRC, (fraction) => {
          buckets.heroImage = Math.round(fraction * 55);
          syncProgress();
        })
      : Promise.resolve().then(() => {
          buckets.heroImage = 55;
          syncProgress();
        });

    const heroRenderTask = waitForHeroReady(12000).then(() => {
      buckets.heroRender = 25;
      syncProgress();
    });

    // Smooth intentional minimum showcase duration (1.25s) even on cached loads,
    // while still waiting for real assets on slower connections (up to 14s failsafe)
    const minGrace = new Promise((r) => window.setTimeout(r, 2250));
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
      aria-label="Loading Fuego Forge"
      className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden touch-none overscroll-none flex items-center justify-center"
    >
      {/* Hidden SVG ClipPath for the Lusion center-curved curtain reveal */}
      <svg className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="ff-loader-curtain-clip" clipPathUnits="objectBoundingBox">
            <path ref={curvePathRef} d="M0 0 L1 0 L1 1 Q0.5 1 0 1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* 100% Solid Opaque Background Photo + Subtle Dark Scrim */}
      <div ref={bgRef} className="absolute inset-0 bg-[#0E0C0B]">
        <img
          ref={bgImgRef}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      {/* Minimalist Aesthetic Circular Progress Ring + Centered Number */}
      <div
        ref={ringWrapRef}
        className="relative z-10 w-[clamp(210px,24vw,300px)] h-[clamp(210px,24vw,300px)] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(243, 236, 200, 0.14)"
            strokeWidth="1.2"
          />
          <circle
            ref={ringArcRef}
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke="#F3ECC8"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={RING_CIRCUMFERENCE}
          />
        </svg>

        <span className="font-editorial text-[clamp(3.2rem,5.5vw,4.8rem)] font-light leading-none tracking-[-0.02em] tabular-nums text-[#F3ECC8]">
          {String(count).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
