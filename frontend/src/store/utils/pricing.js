export const SHIPPING = { freeAbove: 500, flatRate: 50 };

export const sellingPrice = (p) => p.discountPrice ?? p.price;

export const discountPercent = (p) => (p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0);

export const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const payable = items.reduce((sum, i) => sum + sellingPrice(i.product) * i.quantity, 0);
  const shipping = payable === 0 || payable >= SHIPPING.freeAbove ? 0 : SHIPPING.flatRate;
  return {
    subtotal,
    discount: subtotal - payable,
    shipping,
    total: payable + shipping,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};
