import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { normalizeProduct, store, storeApi } from "../api";
import { useCatalog } from "./CatalogContext";
import { calculateTotals } from "../utils/pricing";

const ShopContext = createContext(null);

const GUEST_CART_KEY = "teams24_guest_cart";

const readGuestCart = () => {
  try {
    const items = JSON.parse(localStorage.getItem(GUEST_CART_KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    return;
  }
};

const toCartItems = (serverCart) =>
  (serverCart?.items ?? []).map((item) => ({
    key: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    product: normalizeProduct(item.product),
  }));

export const ShopProvider = ({ children }) => {
  const { products, status: catalogStatus } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(!store.getToken());
  const [serverCart, setServerCart] = useState([]);
  const [guestCart, setGuestCart] = useState(readGuestCart);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const notify = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const loadCart = useCallback(async () => setServerCart(toCartItems(await storeApi.get("/cart"))), []);

  const loadWishlist = useCallback(async () => {
    const wishlist = await storeApi.get("/wishlist");
    setWishlistItems(wishlist.items.map((i) => normalizeProduct(i.product)));
  }, []);

  const resetSession = useCallback(() => {
    store.clearToken();
    setUser(null);
    setServerCart([]);
    setWishlistItems([]);
  }, []);

  useEffect(() => {
    store.setUnauthorizedHandler(resetSession);
  }, [resetSession]);

  useEffect(() => {
    if (!store.getToken()) return;
    storeApi
      .get("/auth/me")
      .then(async (me) => {
        setUser(me);
        await Promise.all([loadCart(), loadWishlist()]);
      })
      .catch(resetSession)
      .finally(() => setAuthReady(true));
  }, [loadCart, loadWishlist, resetSession]);

  useEffect(() => {
    writeGuestCart(guestCart);
  }, [guestCart]);

  useEffect(() => {
    try {
      localStorage.removeItem("teams24_shop");
    } catch {
      return;
    }
  }, []);

  const guestItems = useMemo(
    () =>
      guestCart
        .map((i) => ({ ...i, key: i.productId, product: products.find((p) => p.id === i.productId) }))
        .filter((i) => i.product),
    [guestCart, products],
  );

  const cartItems = user ? serverCart : guestItems;
  const availableItems = cartItems.filter((i) => i.product.isActive && i.product.stock >= i.quantity);
  const totals = useMemo(() => calculateTotals(availableItems), [availableItems]);

  const startSession = async ({ user: account, token }) => {
    store.setToken(token);
    setUser(account);
    const pending = readGuestCart();
    for (const item of pending) {
      try {
        await storeApi.post("/cart/items", { productId: item.productId, quantity: item.quantity });
      } catch {
        continue;
      }
    }
    setGuestCart([]);
    await Promise.all([loadCart(), loadWishlist()]);
    if (pending.length) notify("Items from your cart were added to your account");
  };

  const login = async (email, password) => startSession(await storeApi.post("/auth/login", { email, password }));

  const register = async ({ name, email, password, phone }) =>
    startSession(await storeApi.post("/auth/register", { name, email, password, phone: phone || undefined }));

  const logout = () => {
    resetSession();
    notify("You have been logged out");
  };

  const updateProfile = async (changes) => {
    const updated = await storeApi.patch("/auth/me", changes);
    setUser((u) => ({ ...u, ...updated }));
    return updated;
  };

  const changePassword = (currentPassword, newPassword) =>
    storeApi.patch("/auth/me/password", { currentPassword, newPassword });

  const addToCart = async (productId, quantity = 1) => {
    try {
      if (user) {
        setServerCart(toCartItems(await storeApi.post("/cart/items", { productId, quantity })));
      } else {
        const product = products.find((p) => p.id === productId);
        const existing = guestCart.find((i) => i.productId === productId);
        const next = (existing?.quantity ?? 0) + quantity;
        if (product && next > product.stock) throw new Error(`Only ${product.stock} item(s) in stock`);
        setGuestCart((items) =>
          existing
            ? items.map((i) => (i.productId === productId ? { ...i, quantity: next } : i))
            : [...items, { productId, quantity }],
        );
      }
      notify("Added to cart");
      return true;
    } catch (err) {
      notify(err.message, "error");
      return false;
    }
  };

  const setQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      if (user) {
        setServerCart(toCartItems(await storeApi.patch(`/cart/items/${productId}`, { quantity })));
      } else {
        setGuestCart((items) => items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
      }
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (user) setServerCart(toCartItems(await storeApi.delete(`/cart/items/${productId}`)));
      else setGuestCart((items) => items.filter((i) => i.productId !== productId));
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const clearCart = async () => {
    try {
      if (user) setServerCart(toCartItems(await storeApi.delete("/cart")));
      else setGuestCart([]);
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const wishlistIds = useMemo(() => new Set(wishlistItems.map((p) => p.id)), [wishlistItems]);
  const isWishlisted = (productId) => wishlistIds.has(productId);

  const toggleWishlist = async (productId) => {
    if (!user) {
      notify("Log in to save items to your wishlist", "info");
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    try {
      if (wishlistIds.has(productId)) {
        await storeApi.delete(`/wishlist/items/${productId}`);
        setWishlistItems((items) => items.filter((p) => p.id !== productId));
        notify("Removed from wishlist");
      } else {
        await storeApi.post("/wishlist/items", { productId });
        await loadWishlist();
        notify("Saved to wishlist");
      }
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const placeOrder = async ({ addressId, paymentMethod }) => {
    const order = await storeApi.post("/orders", { addressId, paymentMethod });
    await loadCart();
    return order;
  };

  const value = {
    user,
    authReady,
    catalogReady: catalogStatus === "ready",
    cartItems,
    availableItems,
    totals,
    wishlistItems,
    toast,
    notify,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    isWishlisted,
    toggleWishlist,
    placeOrder,
    refreshCart: loadCart,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => useContext(ShopContext);
