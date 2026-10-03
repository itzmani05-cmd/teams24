const { port } = require("./config/env");
const app = require("./app");
const prisma = require("./lib/prisma");

const server = app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
