"use client";

import { useEffect, useRef } from "react";

export default function Parallax({
  children,
  speed = 0.1,
  scale = 1,
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Progress relative to viewport center (-1 to 1 approx)
      const centerOffset = rect.top + rect.height / 2 - vh / 2;
      const translateY = Math.max(-70, Math.min(70, centerOffset * speed));
      el.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale})`;
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed, scale]);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{ transform: `translate3d(0, 0, 0) scale(${scale})` }}
    >
      {children}
    </div>
  );
}

