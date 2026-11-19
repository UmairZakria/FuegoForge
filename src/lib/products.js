import rawProducts from "../../data/products.json";

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

export function getAllCategories() {
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.category)) {
      map.set(p.category, {
        slug: p.category,
        name: p.categoryName,
        count: 0,
        sampleImage: p.mainImage,
        sampleVideo: p.videoUrl || "",
      });
    }
    const entry = map.get(p.category);
    entry.count++;
    if (!entry.sampleVideo && p.videoUrl) {
      entry.sampleVideo = p.videoUrl;
    }
  }
  return Array.from(map.values());
}
