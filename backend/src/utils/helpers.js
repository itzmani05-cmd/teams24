const crypto = require("node:crypto");

const slugify = (text) =>
  text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getPagination = ({ page = 1, limit = 20 }) => {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const current = Math.max(Number(page) || 1, 1);
  return { take, skip: (current - 1) * take, page: current };
};

const paginated = (items, total, { page, take }) => ({
  items,
  pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
});

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ORD-${date}-${random}`;
};

module.exports = { slugify, getPagination, paginated, generateOrderNumber };
