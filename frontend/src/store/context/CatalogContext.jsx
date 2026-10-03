import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchAll, normalizeCategory, normalizeProduct } from "../api";
import { sellingPrice } from "../utils/pricing";

const CatalogContext = createContext(null);

export const CatalogProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [productItems, categoryItems] = await Promise.all([fetchAll("/products"), fetchAll("/categories")]);
      setProducts(productItems.map(normalizeProduct));
      setCategories(categoryItems.map(normalizeCategory));
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const highest = Math.max(0, ...products.map(sellingPrice));
    return {
      products,
      categories,
      brands,
      priceBounds: { min: 0, max: Math.max(1000, Math.ceil(highest / 1000) * 1000) },
      status,
      error,
      reload: load,
      findProduct: (slug) => products.find((p) => p.slug === slug),
    };
  }, [products, categories, status, error, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => useContext(CatalogContext);
