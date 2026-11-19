"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroReveal({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const lines = root.querySelectorAll("[data-hero-line]");
      const fades = root.querySelectorAll("[data-hero-fade]");
      const portrait = root.querySelector("[data-hero-img]");
      const bottomBar = root.querySelector("[data-hero-bottom-bar]");

      // Initial hidden choreography state
      gsap.set(lines, { yPercent: 112, opacity: 0 });
      gsap.set(fades, { y: 24, opacity: 0 });
      if (portrait) gsap.set(portrait, { scale: 1.09 });
      if (bottomBar) gsap.set(bottomBar, { y: 32, opacity: 0 });

      const playEntrance = () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        if (portrait) {
          tl.to(portrait, { scale: 1, duration: 1.45, ease: "power3.out" }, 0);
        }

        tl.to(
          lines,
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.13,
          },
          0.06
        );

        tl.to(
          fades,
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
          },
          0.28
        );

        if (bottomBar) {
          tl.to(
            bottomBar,
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
            },
            0.38
          );
        }
      };

      if (window.__ffPreloaderDone) {
        playEntrance();
      } else {
        window.addEventListener("ff:preloader-done", playEntrance, { once: true });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

