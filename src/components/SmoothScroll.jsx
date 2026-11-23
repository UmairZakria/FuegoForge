"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      smoothWheel: true,
      anchors: true,
    });

    window.__ffLenis = lenis;

    // Keep Lenis locked while the preloader curtain is active
    if (!window.__ffPreloaderDone) {
      lenis.stop();
    }

    const handlePreloaderDone = () => {
      lenis.scrollTo(0, { immediate: true });
      lenis.start();
    };

    window.addEventListener("ff:preloader-done", handlePreloaderDone);

    return () => {
      window.removeEventListener("ff:preloader-done", handlePreloaderDone);
      if (window.__ffLenis === lenis) {
        delete window.__ffLenis;
      }
      lenis.destroy();
    };
  }, []);

  return null;
}
