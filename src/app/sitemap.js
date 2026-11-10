import { getAllProducts, getAllCategories } from "@/lib/products";

const BUILD_TIMESTAMP = "2026-11-10T10:00:00.000Z";

export default function sitemap() {
  const baseUrl = "https://fuegoforge.vercel.app";
  const products = getAllProducts();
  const categories = getAllCategories();

  const productEntries = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.createdAt || BUILD_TIMESTAMP,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  const categoryEntries = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: BUILD_TIMESTAMP,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: BUILD_TIMESTAMP,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    ...categoryEntries,
    ...productEntries,
  ];
}
