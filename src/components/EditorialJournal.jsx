import Parallax from "@/components/Parallax";

const JOURNAL_STORIES = [
  {
    id: "story-1",
    title: "Crafted for moments that deserve to feel extraordinary.",
    readTime: "4 Min Read",
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=85",
    alt: "Sculpted gold hoop earrings resting on travertine stone",
  },
  {
    id: "story-2",
    title: "Discover the artistry and craftsmanship behind every piece.",
    readTime: "7 Min Read",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=85",
    alt: "Layered gold crescent and gemstone pendant necklaces",
  },
  {
    id: "story-3",
    title: "Explore timeless designs crafted for everyday elegance.",
    readTime: "9 Min Read",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
    alt: "Intricate gold and crystal filigree bracelet on warm ivory",
  },
];

export default function EditorialJournal() {
  return (
    <section
      id="journal"
      className="layout-shell pb-[var(--section-gap)] pt-[clamp(16px,2vw,32px)] space-y-[clamp(24px,2.4vw,44px)]"
    >
      {/* Top Header Split */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <h2 className="font-editorial type-h1 font-light uppercase text-[var(--text-primary)] tracking-[-0.01em] leading-[0.98]">
          Stories of <br />
          Light &amp; Form
        </h2>

        <p className="font-poppins text-[length:var(--text-sm)] text-[var(--text-secondary)] font-light leading-relaxed max-w-xs md:text-right">
          Explore the stories, inspirations, and craftsmanship behind the world of FUEGO FORGE.
        </p>
      </div>

      {/* 3-Column Editorial Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--grid-gap)]">
        {JOURNAL_STORIES.map((story) => (
          <article
            key={story.id}
            className="group bg-[#FAF7F2] border border-[var(--border-light)] rounded-[14px] p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-colors"
          >
            <h3 className="font-title font-medium text-[clamp(1rem,1.15vw,1.22rem)] text-[var(--text-primary)] leading-snug group-hover:text-[var(--burgundy)] transition-colors">
              {story.title}
            </h3>

            <div className="relative aspect-[3/4] rounded-[10px] overflow-hidden bg-[var(--bg-secondary)]">
              <Parallax speed={0.05} scale={1.06} className="w-full h-full">
                <img
                  src={story.image}
                  alt={story.alt}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </Parallax>

              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[var(--burgundy)] text-[#FAF7F2] text-[10px] font-poppins tracking-[0.05em]">
                {story.readTime}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

