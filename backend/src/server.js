const { port } = require("./config/env");
const app = require("./app");
const prisma = require("./lib/prisma");

const server = app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  const started = Date.now();
  prisma
    .warmUp()
    .then(() => console.log(`Database connected in ${Date.now() - started}ms`))
    .catch((err) => console.error("Database warm-up failed:", err.message));
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
