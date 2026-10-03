require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 5 * 60 * 1000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
});

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const warmUp = (connections = 3) =>
  Promise.all(Array.from({ length: connections }, () => prisma.$queryRaw`SELECT 1`));

module.exports = prisma;
module.exports.warmUp = warmUp;
