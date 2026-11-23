"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ProductPageReveal({ slug, children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const breadcrumb = root.querySelector("[data-product-breadcrumb]");
      const gallery = root.querySelector("[data-product-gallery]");
      const panel = root.querySelector("[data-product-panel]");
      const staggerItems = root.querySelectorAll("[data-product-stagger]");

      if (breadcrumb) gsap.set(breadcrumb, { y: -12, opacity: 0 });
      if (gallery) gsap.set(gallery, { y: 44, scale: 0.96, opacity: 0 });
      if (panel) gsap.set(panel, { y: 40, opacity: 0 });
      if (staggerItems.length) gsap.set(staggerItems, { y: 24, opacity: 0 });

      const playEntrance = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (breadcrumb) {
          tl.to(breadcrumb, { y: 0, opacity: 1, duration: 0.6 }, 0.08);
        }
        if (gallery) {
          tl.to(gallery, { y: 0, scale: 1, opacity: 1, duration: 1.0 }, 0.12);
        }
        if (panel) {
          tl.to(panel, { y: 0, opacity: 1, duration: 0.9 }, 0.22);
        }
        if (staggerItems.length) {
          tl.to(
            staggerItems,
            {
              y: 0,
              opacity: 1,
              duration: 0.72,
              stagger: 0.1,
            },
            0.32
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
  }, [slug]);

  return <div ref={rootRef}>{children}</div>;
}
