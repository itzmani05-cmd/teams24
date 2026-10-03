require("dotenv/config");
const bcrypt = require("bcryptjs");
const prisma = require("../src/lib/prisma");

const main = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed an admin");

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

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
