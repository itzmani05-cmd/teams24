require("dotenv/config");

const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  shipping: {
    freeAbove: Number(process.env.FREE_SHIPPING_ABOVE) || 500,
    flatRate: Number(process.env.SHIPPING_FLAT_RATE) || 50,
  },
};
