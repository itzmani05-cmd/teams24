const { z } = require("./common");

const quantity = z.coerce.number().int().min(1).max(99);

const addCartItem = z.object({ productId: z.uuid(), quantity: quantity.default(1) });
const updateCartItem = z.object({ quantity });
const productParam = z.object({ productId: z.uuid() });
const addWishlistItem = z.object({ productId: z.uuid() });

module.exports = { addCartItem, updateCartItem, productParam, addWishlistItem };
