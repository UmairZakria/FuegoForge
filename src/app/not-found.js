import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Page Not Found | FUEGO FORGE",
  description: "Explore the complete handcrafted fine jewelry archive by Fuego Forge.",
};

export default function NotFound() {
  return (
    <div className="layout-shell min-h-[75vh] pt-[clamp(96px,9vw,136px)] pb-[var(--section-gap)] flex flex-col items-center justify-center text-center space-y-6">
      <span className="text-xs font-poppins text-[#9E2A30] font-semibold uppercase tracking-[0.2em]">
        404 • Archive Entry Not Found
      </span>

      <h1 className="font-editorial type-h1 font-light uppercase text-[var(--text-primary)] leading-none max-w-xl">
        This Piece Has Left the Atelier.
      </h1>

      <p className="font-poppins text-sm text-[var(--text-secondary)] font-light max-w-md leading-relaxed">
        The creation or collection you are looking for may have moved. Explore our complete handcrafted archive below.
      </p>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/#creations"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171515] hover:bg-[#9E2A30] text-white text-xs font-poppins font-medium transition-colors"
        >
          <span>Explore Archive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#171515] text-[#171515] hover:bg-[#171515] hover:text-white text-xs font-poppins font-medium transition-colors"
        >
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
}

