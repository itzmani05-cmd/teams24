import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products, sellingPrice, SHIPPING } from "../data/catalog";

const ShopContext = createContext(null);

const STORAGE_KEY = "teams24_shop";

const DEFAULT_ADDRESSES = [
  {
    id: "addr-1",
    label: "Home",
    fullName: "John Doe",
    phone: "+91 98765 43210",
    addressLine1: "123, Green Park",
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110016",
    country: "India",
    isDefault: true,
  },
];

const initialState = {
  cart: [],
  wishlist: [],
  user: null,
  orders: [],
  addresses: DEFAULT_ADDRESSES,
};

const load = () => {
  try {
    return { ...initialState, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return initialState;
  }
};

const productById = (id) => products.find((p) => p.id === id);

export const ShopProvider = ({ children }) => {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      return;
    }
  }, [state]);

  const update = (fn) => setState((s) => ({ ...s, ...fn(s) }));

  const cartItems = useMemo(
    () => state.cart.map((item) => ({ ...item, product: productById(item.productId) })).filter((item) => item.product),
    [state.cart],
  );

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const payable = cartItems.reduce((sum, i) => sum + sellingPrice(i.product) * i.quantity, 0);
    const discount = subtotal - payable;
    const shipping = payable === 0 || payable >= SHIPPING.freeAbove ? 0 : SHIPPING.flatRate;
    return {
      subtotal,
      discount,
      shipping,
      total: payable + shipping,
      count: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    };
  }, [cartItems]);

  const itemKey = (productId, options = {}) => [productId, options.color, options.size].filter(Boolean).join("|");

  const addToCart = (productId, quantity = 1, options = {}) =>
    update((s) => {
      const key = itemKey(productId, options);
      const existing = s.cart.find((i) => i.key === key);
      const stock = productById(productId)?.stock ?? 0;
      if (existing) {
        return {
          cart: s.cart.map((i) => (i.key === key ? { ...i, quantity: Math.min(stock, i.quantity + quantity) } : i)),
        };
      }
      return { cart: [...s.cart, { key, productId, quantity: Math.min(stock, quantity), ...options }] };
    });

  const setQuantity = (key, quantity) =>
    update((s) => ({
      cart: s.cart.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i)),
    }));

  const removeFromCart = (key) => update((s) => ({ cart: s.cart.filter((i) => i.key !== key) }));

  const clearCart = () => update(() => ({ cart: [] }));

  const isWishlisted = (productId) => state.wishlist.includes(productId);

  const toggleWishlist = (productId) =>
    update((s) => ({
      wishlist: s.wishlist.includes(productId)
        ? s.wishlist.filter((id) => id !== productId)
        : [...s.wishlist, productId],
    }));

  const login = ({ email, name }) => update(() => ({ user: { name: name || email.split("@")[0], email } }));

  const logout = () => update(() => ({ user: null }));

  const addAddress = (address) => {
    const id = `addr-${Date.now()}`;
    update((s) => {
      const isDefault = address.isDefault || s.addresses.length === 0;
      return {
        addresses: [
          ...s.addresses.map((a) => (isDefault ? { ...a, isDefault: false } : a)),
          { ...address, id, isDefault },
        ],
      };
    });
    return id;
  };

  const removeAddress = (id) => update((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));

  const placeOrder = ({ addressId, paymentMethod }) => {
    const number = `ORD${Date.now().toString().slice(-6)}`;
    const order = {
      id: number,
      number,
      placedAt: new Date().toISOString(),
      status: "pending",
      paymentMethod,
      address: state.addresses.find((a) => a.id === addressId),
      items: cartItems.map((i) => ({
        productId: i.productId,
        name: i.product.name,
        thumbnail: i.product.thumbnail,
        price: sellingPrice(i.product),
        quantity: i.quantity,
        color: i.color,
        size: i.size,
      })),
      ...totals,
    };
    update((s) => ({ orders: [order, ...s.orders], cart: [] }));
    return order;
  };

  const value = {
    ...state,
    cartItems,
    totals,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    isWishlisted,
    toggleWishlist,
    login,
    logout,
    addAddress,
    removeAddress,
    placeOrder,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => useContext(ShopContext);
