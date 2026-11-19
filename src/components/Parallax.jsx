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
    let isVisible = false;

    const update = () => {
      rafId = 0;
      if (!isVisible) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centerOffset = rect.top + rect.height / 2 - vh / 2;
      const translateY = Math.max(-64, Math.min(64, centerOffset * speed));
      el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale})`;
    };

    const onScroll = () => {
      if (isVisible && !rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) onScroll();
      },
      { rootMargin: "160px 0px" }
    );

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
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
