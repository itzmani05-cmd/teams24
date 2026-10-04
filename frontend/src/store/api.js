import { createApiClient } from "../api/client";

export const store = createApiClient("customer_token");
export const storeApi = store.api;

const CATEGORY_ICONS = {
  electronics: "Smartphone",
  fashion: "Shirt",
  "home-kitchen": "Home",
  books: "BookOpen",
  "beauty-personal-care": "Sparkles",
  "sports-fitness": "Dumbbell",
};

export const normalizeProduct = (p) => {
  const thumbnail = p.thumbnailUrl || p.images?.[0]?.imageUrl || null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    description: p.description,
    price: Number(p.price),
    discountPrice: p.discountPrice == null ? null : Number(p.discountPrice),
    stock: p.stock ?? 0,
    isActive: p.isActive ?? true,
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    thumbnail,
    images: p.images?.length ? p.images.map((i) => i.imageUrl) : thumbnail ? [thumbnail] : [],
    rating: p.rating?.average ?? null,
    reviewCount: p.rating?.count ?? 0,
    createdAt: p.createdAt ? new Date(p.createdAt).getTime() : 0,
  };
};

export const normalizeCategory = (c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  icon: CATEGORY_ICONS[c.slug] || "Tag",
  image: c.imageUrl,
  count: c._count?.products ?? 0,
});

export const fetchAll = async (path, params = {}) => {
  const first = await storeApi.get(path, { ...params, page: 1, limit: 100 });
  let items = first.items;
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const next = await storeApi.get(path, { ...params, page, limit: 100 });
    items = items.concat(next.items);
  }
  return items;
};
