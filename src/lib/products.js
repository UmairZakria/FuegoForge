import rawProducts from "../../data/products.json";

export function getAllProducts() {
  return rawProducts;
}

export function getProductBySlug(slug) {
  return rawProducts.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(categorySlug) {
  if (!categorySlug || categorySlug === "all") return rawProducts;
  return rawProducts.filter((p) => p.category === categorySlug);
}

export function getAllCategories() {
  const map = new Map();
  for (const p of rawProducts) {
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
