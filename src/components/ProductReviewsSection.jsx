"use client";

import { useState, useMemo } from "react";
import { Star, CheckCircle2, X, Camera } from "lucide-react";

export default function ProductReviewsSection({
  reviews = [],
  rating = 5.0,
  reviewsCount = 0,
}) {
  const [lightboxImage, setLightboxImage] = useState(null);
  const [onlyPhotos, setOnlyPhotos] = useState(false);

  const safeReviews = useMemo(
    () => (Array.isArray(reviews) ? reviews.filter((r) => r && r.text) : []),
    [reviews]
  );

  const allPhotos = useMemo(() => {
    const out = [];
    for (const rev of safeReviews) {
      if (Array.isArray(rev.images)) {
        for (const img of rev.images) {
          if (img && typeof img === "string") {
            out.push({
              url: img,
              author: rev.author || "Verified Buyer",
              rating: rev.rating || 5,
              text: rev.text || "",
            });
          }
        }
      }
    }
    return out;
  }, [safeReviews]);

  if (safeReviews.length === 0) return null;

  const visibleReviews = onlyPhotos
    ? safeReviews.filter((r) => Array.isArray(r.images) && r.images.length > 0)
    : safeReviews;

  const avgRating = Number(rating || 4.9).toFixed(1);
  const totalCount = reviewsCount || safeReviews.length;

  return (
    <section
      id="customer-reviews"
      className="border-t border-[var(--border-light)] pt-[var(--block-gap)] space-y-8"
    >
      {/* Header + Rating Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-poppins text-[var(--burgundy)] font-medium block">
            Verified Collector Notes
          </span>
          <h2 className="font-cormorant text-[clamp(1.75rem,2.4vw,2.5rem)] leading-[1.1] font-medium italic text-[#171515]">
            Client Reviews &amp; Impressions
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[12px] px-5 py-3.5">
          <div className="flex items-baseline gap-2">
            <span className="font-poppins text-3xl font-semibold text-[#171515] tracking-tight">
              {avgRating}
            </span>
            <span className="text-xs font-poppins text-[var(--text-muted)]">/ 5.0</span>
          </div>

          <div className="h-8 w-px bg-[var(--border-light)]" />

          <div className="space-y-1">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((idx) => (
                <Star
                  key={idx}
                  className="w-3.5 h-3.5 fill-[#171515] text-[#171515]"
                />
              ))}
            </div>
            <div className="text-[11.5px] font-poppins text-[var(--text-secondary)] font-light">
              Based on {totalCount} verified {totalCount === 1 ? "review" : "reviews"}
            </div>
          </div>

          {allPhotos.length > 0 && (
            <>
              <div className="h-8 w-px bg-[var(--border-light)] hidden sm:block" />
              <button
                type="button"
                onClick={() => setOnlyPhotos((v) => !v)}
                className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-poppins border transition-colors cursor-pointer ${
                  onlyPhotos
                    ? "bg-[#171515] text-white border-[#171515]"
                    : "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-light)] hover:border-[#171515]"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>With Photos ({allPhotos.length})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Photos Strip */}
      {allPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-poppins font-medium text-[var(--text-secondary)]">
            Customer Photography
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {allPhotos.slice(0, 14).map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxImage(photo)}
                className="group relative w-22 h-22 sm:w-24 sm:h-24 rounded-[10px] overflow-hidden border border-[var(--border-light)] bg-[var(--bg-card)] shrink-0 cursor-pointer"
                title={`Review photo by ${photo.author}`}
              >
                <img
                  src={photo.url}
                  alt={`Customer photo by ${photo.author}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editorial 2-Column Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleReviews.map((review, idx) => (
          <article
            key={review.id || idx}
            className="bg-[var(--bg-card)]/90 border border-[var(--border-light)] rounded-[12px] p-5 sm:p-6 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              {/* Stars & Verified Pill */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3.5 h-3.5 ${
                        starIdx < (review.rating || 5)
                          ? "fill-[#171515] text-[#171515]"
                          : "text-[var(--border-light)]"
                      }`}
                    />
                  ))}
                </div>

                {review.verified !== false && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-poppins text-[var(--burgundy)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Buyer</span>
                  </span>
                )}
              </div>

              {/* Variant Badge if present */}
              {review.variant && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-poppins bg-[var(--bg-primary)] border border-[var(--border-light)] text-[var(--text-secondary)]">
                  {review.variant}
                </span>
              )}

              {/* Review Text */}
              <p className="font-poppins text-[14px] text-[var(--text-primary)] leading-relaxed font-light">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* Inline Review Photos */}
              {Array.isArray(review.images) && review.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {review.images.slice(0, 4).map((imgUrl, imgIdx) => (
                    <button
                      key={imgIdx}
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: imgUrl,
                          author: review.author || "Verified Buyer",
                          rating: review.rating || 5,
                          text: review.text || "",
                        })
                      }
                      className="w-16 h-16 rounded-[8px] overflow-hidden border border-[var(--border-light)] bg-[var(--bg-primary)] hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo by ${review.author || "Verified Buyer"}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer: Author + Date */}
            <div className="pt-3 border-t border-[var(--border-light)] flex items-center justify-between text-xs font-poppins">
              <span className="font-medium text-[#171515]">
                {review.author || "Verified Buyer"}
              </span>
              {review.date && (
                <span className="text-[var(--text-muted)] font-light">
                  {review.date}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* Customer Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[14px] max-w-2xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-light)]">
              <div className="flex items-center gap-2.5">
                <span className="font-poppins text-sm font-medium text-[#171515]">
                  {lightboxImage.author}
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: lightboxImage.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#171515] text-[#171515]" />
                  ))}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[#171515] cursor-pointer"
                aria-label="Close photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#171515] flex items-center justify-center max-h-[68vh]">
              <img
                src={lightboxImage.url}
                alt={`Review by ${lightboxImage.author}`}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
            {lightboxImage.text && (
              <div className="px-5 py-4 text-xs sm:text-sm font-poppins text-[var(--text-secondary)] font-light leading-relaxed">
                &ldquo;{lightboxImage.text}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
