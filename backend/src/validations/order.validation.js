const { z, paginationQuery } = require("./common");

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const PAYMENT_METHODS = ["cod", "card", "upi", "netbanking", "wallet"];

const checkout = z.object({
  addressId: z.uuid(),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

const myOrdersQuery = z.object({
  ...paginationQuery,
  status: z.enum(ORDER_STATUSES).optional(),
});

const adminOrdersQuery = z.object({
  ...paginationQuery,
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  userId: z.uuid().optional(),
  search: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

const updateStatus = z.object({ orderStatus: z.enum(ORDER_STATUSES) });
const updatePaymentStatus = z.object({ paymentStatus: z.enum(PAYMENT_STATUSES) });

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  checkout,
  myOrdersQuery,
  adminOrdersQuery,
  updateStatus,
  updatePaymentStatus,
};
