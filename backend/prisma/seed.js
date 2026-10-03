require("dotenv/config");
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");
const { slugify } = require("../src/utils/helpers");
const catalog = require("./data/products.json");

const placeholderImage = (sku, n) => `https://picsum.photos/seed/${encodeURIComponent(`${sku}-${n}`)}/600/600`;

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Skipping admin: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create one");
    return;
  }

  const admin = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "admin", isActive: true },
    create: {
      name: process.env.ADMIN_NAME || "Admin",
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });
  console.log(`Admin ready: ${admin.email}`);
};

const validateProduct = (product, categoryName) => {
  const label = `"${product.name || product.sku}" in ${categoryName}`;
  if (!product.name || !product.sku || product.price == null) {
    throw new Error(`Product ${label} needs name, sku and price`);
  }
  if (product.discountPrice != null && product.discountPrice >= product.price) {
    throw new Error(`Product ${label} has discountPrice that is not lower than price`);
  }
};

const seedCatalog = async () => {
  let createdCategories = 0;
  let createdProducts = 0;
  let skippedProducts = 0;

  for (const { products = [], ...categoryData } of catalog) {
    const slug = categoryData.slug || slugify(categoryData.name);
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    const category =
      existingCategory ||
      (await prisma.category.create({
        data: {
          name: categoryData.name,
          slug,
          description: categoryData.description ?? null,
          imageUrl: categoryData.imageUrl ?? placeholderImage(slug, 0),
        },
      }));
    if (!existingCategory) createdCategories++;

    for (const product of products) {
      validateProduct(product, category.name);

      const exists = await prisma.product.findUnique({ where: { sku: product.sku } });
      if (exists) {
        skippedProducts++;
        continue;
      }

      const images = product.images?.length
        ? product.images
        : [1, 2, 3].map((n) => placeholderImage(product.sku, n));

      await prisma.product.create({
        data: {
          categoryId: category.id,
          name: product.name,
          slug: product.slug || slugify(product.name),
          sku: product.sku,
          brand: product.brand ?? null,
          description: product.description ?? null,
          price: product.price,
          discountPrice: product.discountPrice ?? null,
          stock: product.stock ?? 0,
          isActive: product.isActive ?? true,
          thumbnailUrl: product.thumbnailUrl ?? images[0],
          images: { create: images.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })) },
        },
      });
      createdProducts++;
    }
  }

  console.log(
    `Catalog: ${createdCategories} categories added, ${createdProducts} products added, ${skippedProducts} already existed`
  );
};

const main = async () => {
  await seedAdmin();
  await seedCatalog();
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
