import seed from "../../../../backend/prisma/data/products.json";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const image = (key, n = 1) => `https://picsum.photos/seed/${encodeURIComponent(`${key}-${n}`)}/600/600`;

const hash = (text) => [...text].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

const CATEGORY_ICONS = {
  electronics: "Smartphone",
  fashion: "Shirt",
  "home-kitchen": "Home",
  books: "BookOpen",
  "beauty-personal-care": "Sparkles",
  "sports-fitness": "Dumbbell",
};

const SIZES = {
  fashion: ["S", "M", "L", "XL"],
};

const COLORS = [
  { name: "Black", value: "black" },
  { name: "Orange", value: "orange" },
  { name: "Gray", value: "gray" },
  { name: "White", value: "white" },
];

export const categories = seed.map((c) => ({
  name: c.name,
  slug: c.slug,
  description: c.description,
  icon: CATEGORY_ICONS[c.slug] || "Tag",
  count: c.products.length,
}));

export const products = seed.flatMap((c) =>
  c.products.map((p) => {
    const h = hash(p.sku);
    return {
      id: p.sku,
      sku: p.sku,
      name: p.name,
      slug: slugify(p.name),
      brand: p.brand,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      stock: p.stock ?? 0,
      category: { name: c.name, slug: c.slug },
      thumbnail: image(p.sku, 1),
      images: [1, 2, 3, 4].map((n) => image(p.sku, n)),
      rating: Math.round((3.6 + (h % 14) / 10) * 10) / 10,
      reviewCount: 12 + (h % 240),
      colors: ["fashion", "electronics", "sports-fitness"].includes(c.slug) ? COLORS.slice(0, 2 + (h % 3)) : [],
      sizes: SIZES[c.slug] || [],
      createdAt: h,
    };
  })
);

export const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();

export const priceBounds = {
  min: 0,
  max: Math.ceil(Math.max(...products.map((p) => p.discountPrice ?? p.price)) / 1000) * 1000,
};

export const sellingPrice = (p) => p.discountPrice ?? p.price;

export const discountPercent = (p) =>
  p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;

export const findProduct = (slug) => products.find((p) => p.slug === slug);

export const featuredProducts = [...products].sort((a, b) => discountPercent(b) - discountPercent(a)).slice(0, 8);

export const SHIPPING = { freeAbove: 500, flatRate: 50 };

export const mockReviews = (product) =>
  ["Aarav S.", "Priya K.", "Rahul M.", "Sneha R."].map((name, i) => ({
    id: `${product.sku}-r${i}`,
    name,
    rating: Math.max(3, Math.min(5, Math.round(product.rating) - (i % 2))),
    date: `${10 + i * 4} Sep 2026`,
    comment: [
      "Exactly as described. Quality is great for the price.",
      "Fast delivery and well packed. Would buy again.",
      "Good product overall, matches the pictures.",
      "Value for money. Happy with the purchase.",
    ][i],
    verified: i !== 2,
  }));
