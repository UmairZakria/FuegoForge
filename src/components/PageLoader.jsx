"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const CRITICAL_ASSETS = ["/hero-editorial.jpg"];

export default function PageLoader() {
  const [count, setCount] = useState(0);
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
        window.dispatchEvent(new CustomEvent("ff:preloader-done"));
        return;
      }
    } catch {
      // ignore storage errors
    }

    document.documentElement.style.overflow = "hidden";
    let cancelled = false;
    let revealed = false;

    const progressObj = { value: 0 };

    // Smooth initial ramp up to 84% while assets preload
    const rampTween = gsap.to(progressObj, {
      value: 84,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        if (!cancelled) {
          const v = Math.round(progressObj.value);
          setCount(v);
          if (barRef.current) {
            barRef.current.style.transform = `scaleX(${progressObj.value / 100})`;
          }
        }
      },
    });

    const triggerReveal = () => {
      if (revealed || cancelled) return;
      revealed = true;
      rampTween.kill();

      try {
        sessionStorage.setItem("ff_lusion_loaded", "1");
      } catch {
        // ignore
      }

      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = "";
          if (!cancelled) setMounted(false);
        },
      });

      // 1. Finish counter smoothly to 100
      tl.to(progressObj, {
        value: 100,
        duration: 0.45,
        ease: "power3.out",
        onUpdate: () => {
          if (!cancelled) {
            const v = Math.round(progressObj.value);
            setCount(v);
            if (barRef.current) {
              barRef.current.style.transform = `scaleX(${progressObj.value / 100})`;
            }
          }
        },
      });

      // 2. Lift counter & center emblem out
      tl.to(
        contentRef.current,
        {
          y: -48,
          opacity: 0,
          duration: 0.45,
          ease: "power3.in",
        },
        "+=0.08"
      );

      // 3. Fire Hero GSAP entrance right as the curved curtain begins lifting!
      tl.add(() => {
        window.__ffPreloaderDone = true;
        window.dispatchEvent(new CustomEvent("ff:preloader-done"));
      }, "-=0.12");

      // 4. Lusion-style curved SVG veil morph & upward sweep
      if (curvePathRef.current) {
        tl.to(
          curvePathRef.current,
          {
            attr: { d: "M0 0 L100 0 L100 100 Q50 72 0 100 Z" },
            duration: 0.42,
            ease: "power2.in",
          },
          "-=0.1"
        ).to(
          curvePathRef.current,
          {
            attr: { d: "M0 0 L100 0 L100 0 Q50 0 0 0 Z" },
            duration: 0.62,
            ease: "power4.out",
          },
          "-=0.05"
        );
      } else {
        tl.to(rootRef.current, {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
        });
      }
    };

    const imagePromises = CRITICAL_ASSETS.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        })
    );

    const fontsPromise =
      typeof document !== "undefined" && document.fonts
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();

    const minDelay = new Promise((r) => window.setTimeout(r, 750));
    const maxTimeout = window.setTimeout(triggerReveal, 2100);

    Promise.all([...imagePromises, fontsPromise, minDelay]).then(triggerReveal);

    return () => {
      cancelled = true;
      rampTween.kill();
      window.clearTimeout(maxTimeout);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-auto select-none overflow-hidden"
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

        {/* Center Sculptural Rotating Atelier Emblem */}
        <div className="flex flex-col items-center justify-center gap-5 my-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-white/15 animate-[spin_9s_linear_infinite]" />
            <span className="absolute inset-2 rotate-45 border border-[#D9464F]/70 animate-[spin_6s_linear_infinite_reverse]" />
            <span className="w-2 h-2 rounded-full bg-[#D9464F]" />
          </div>
          <span className="text-[11px] font-poppins uppercase tracking-[0.26em] text-white/50">
            Entering Atelier
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
