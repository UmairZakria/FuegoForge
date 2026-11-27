import rawProducts from "../../data/products.json";
import siteConfig from "@/lib/site-config";

const products = rawProducts.map((product) => ({
  ...product,
  rating: Number((4.6 + Math.random() * 0.4).toFixed(1)),
  reviewsCount: Math.floor(Math.random() * (135 - 18 + 1)) + 18,
}));

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(categorySlug) {
  if (!categorySlug || categorySlug === "all") return products;
  return products.filter((p) => p.category === categorySlug);
}

export function getAllCategories({ includeHidden = false } = {}) {
  const covers = siteConfig?.categoriesSection?.covers || {};
  const map = new Map();
  let defaultOrder = 0;

  for (const p of products) {
    if (!map.has(p.category)) {
      const override = covers[p.category] || {};
      map.set(p.category, {
        slug: p.category,
        name: override.label || p.categoryName,
        count: 0,
        sampleImage: override.image || p.mainImage,
        sampleVideo: p.videoUrl || "",
        hidden: Boolean(override.hidden),
        order: typeof override.order === "number" ? override.order : defaultOrder++,
      });
    }
    const entry = map.get(p.category);
    entry.count++;
    if (!entry.sampleVideo && p.videoUrl) {
      entry.sampleVideo = p.videoUrl;
    }
  }

  return Array.from(map.values())
    .filter((c) => includeHidden || !c.hidden)
    .sort((a, b) => a.order - b.order);
}
