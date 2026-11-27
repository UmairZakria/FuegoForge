import siteConfig from "@/lib/site-config";

const DEFAULT_ANNOUNCEMENTS = [
  "50% Off Boutique Privilege on Etsy",
  "Complimentary Tracked Worldwide Delivery",
  "100% Handcrafted Artisan Fine Jewelry",
  "30-Day Verified Etsy Buyer Protection",
  "Complimentary Luxury Gift Box Included",
];

function RibbonTrack({ items, ariaHidden = false }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex items-center shrink-0"
    >
      {[...items, ...items].map((text, idx) => (
        <span
          key={`${text}-${idx}`}
          className="inline-flex items-center whitespace-nowrap text-[11px] sm:text-xs font-poppins font-normal tracking-[0.08em] text-[#FAF7F2]/95"
        >
          <span>{text}</span>
          <span
            aria-hidden="true"
            className="mx-6 sm:mx-8 text-[#F3ECC8]/75 text-[9px] select-none"
          >
            •
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AnnouncementRibbon() {
  const ann = siteConfig?.announcement || {};
  if (ann.enabled === false) return null;
  const items =
    Array.isArray(ann.items) && ann.items.length > 0 ? ann.items : DEFAULT_ANNOUNCEMENTS;

  return (
    <a
      href={ann.href || "https://fuegoforge.etsy.com?ref=share_and_save"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Shop Fuego Forge 50% off boutique privilege on Etsy"
      className="relative z-30 group block w-full overflow-hidden bg-[#6E2628] hover:bg-[#7A2B2E] py-1.5 sm:py-2 transition-colors"
    >
      <div className="animate-ff-marquee group-hover:[animation-play-state:paused]">
        <RibbonTrack items={items} />
        <RibbonTrack items={items} ariaHidden />
      </div>
    </a>
  );
}
