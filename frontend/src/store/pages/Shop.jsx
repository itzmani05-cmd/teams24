import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { SlidersHorizontal, Star, X } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { discountPercent, sellingPrice } from "../utils/pricing";
import ProductCard from "../components/ProductCard";
import Breadcrumbs from "../components/Breadcrumbs";

const SORTS = {
  popular: { label: "Popular", fn: (a, b) => b.reviewCount - a.reviewCount },
  newest: { label: "Newest", fn: (a, b) => b.createdAt - a.createdAt },
  price_asc: { label: "Price: Low to High", fn: (a, b) => sellingPrice(a) - sellingPrice(b) },
  price_desc: { label: "Price: High to Low", fn: (a, b) => sellingPrice(b) - sellingPrice(a) },
  discount: { label: "Biggest Discount", fn: (a, b) => discountPercent(b) - discountPercent(a) },
};

const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

const Shop = ({ deals = false }) => {
  const { products, categories, brands, priceBounds, status, error, reload } = useCatalog();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const selectedCategories = params.getAll("category");

  const [priceLimit, setPriceLimit] = useState(null);
  const maxPrice = priceLimit ?? priceBounds.max;
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandQuery, setBrandQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState(deals ? "discount" : "popular");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setCategories = (list) => {
    const next = new URLSearchParams(params);
    next.delete("category");
    list.forEach((c) => next.append("category", c));
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const term = q.toLowerCase();
    return products
      .filter((p) => !deals || p.discountPrice)
      .filter((p) => !selectedCategories.length || selectedCategories.includes(p.category?.slug))
      .filter((p) => !selectedBrands.length || selectedBrands.includes(p.brand))
      .filter((p) => priceLimit === null || sellingPrice(p) <= priceLimit)
      .filter((p) => !minRating || (p.rating ?? 0) >= minRating)
      .filter(
        (p) =>
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term) ||
          p.category?.name.toLowerCase().includes(term),
      )
      .sort(SORTS[sort].fn);
  }, [products, q, deals, selectedCategories, selectedBrands, priceLimit, minRating, sort]);

  const activeCategory = selectedCategories.length === 1 && categories.find((c) => c.slug === selectedCategories[0]);
  const title = deals
    ? "Today's Deals"
    : q
      ? `Results for "${q}"`
      : activeCategory
        ? activeCategory.name
        : "All Products";

  const visibleBrands = brands.filter((b) => b.toLowerCase().includes(brandQuery.toLowerCase()));
  const hasFilters = selectedCategories.length || selectedBrands.length || minRating || priceLimit !== null || q;

  const resetFilters = () => {
    setParams(new URLSearchParams(), { replace: true });
    setSelectedBrands([]);
    setPriceLimit(null);
    setMinRating(0);
  };

  return (
    <div className="page-container">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: deals ? "Deals" : activeCategory?.name || "Shop" }]} />

      <div className="grid items-start gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-[300px] max-w-[85vw] overflow-y-auto border border-line bg-surface p-[18px] transition-transform duration-200 md:sticky md:top-[84px] md:z-auto md:w-auto md:max-w-none md:translate-x-0 md:overflow-visible md:rounded-xl ${filtersOpen ? "translate-x-0" : "-translate-x-[105%]"}`}
        >
          <div className="mb-2 flex items-center justify-between [&>h3]:text-base [&>h3]:font-bold">
            <h3>Filters</h3>
            <button
              type="button"
              className="inline-grid size-[38px] cursor-pointer place-items-center rounded-full text-ink hover:text-primary md:hidden"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          </div>

          <div className="border-t border-line py-3.5 [&>h4]:mb-2.5 [&>h4]:text-sm [&>h4]:font-bold">
            <h4>Categories</h4>
            {categories.map((c) => (
              <label
                key={c.slug}
                className="flex min-h-[34px] cursor-pointer items-center gap-2 py-1 [&>input]:accent-primary"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c.slug)}
                  onChange={() => setCategories(toggle(selectedCategories, c.slug))}
                />
                <span>{c.name}</span>
                <span className="ml-auto text-xs text-muted">{c.count}</span>
              </label>
            ))}
          </div>

          <div className="border-t border-line py-3.5 [&>h4]:mb-2.5 [&>h4]:text-sm [&>h4]:font-bold">
            <h4>Price Range</h4>
            <input
              type="range"
              className="w-full cursor-pointer accent-primary"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={maxPrice}
              onChange={(e) => setPriceLimit(Number(e.target.value) >= priceBounds.max ? null : Number(e.target.value))}
              aria-label="Maximum price"
            />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>₹{priceBounds.min}</span>
              <span>Up to ₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="border-t border-line py-3.5 [&>h4]:mb-2.5 [&>h4]:text-sm [&>h4]:font-bold">
            <h4>Brand</h4>
            <input
              className="input mb-2"
              placeholder="Search brands..."
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
            />
            <div className="max-h-[180px] overflow-y-auto">
              {visibleBrands.map((b) => (
                <label
                  key={b}
                  className="flex min-h-[34px] cursor-pointer items-center gap-2 py-1 [&>input]:accent-primary"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => setSelectedBrands((list) => toggle(list, b))}
                  />
                  <span>{b}</span>
                </label>
              ))}
              {visibleBrands.length === 0 && <span className="text-muted">No brands found</span>}
            </div>
          </div>

          <div className="border-t border-line py-3.5 [&>h4]:mb-2.5 [&>h4]:text-sm [&>h4]:font-bold">
            <h4>Rating</h4>
            {[4, 3].map((r) => (
              <label
                key={r}
                className="flex min-h-[34px] cursor-pointer items-center gap-2 py-1 [&>input]:accent-primary"
              >
                <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={n <= r ? "fill-primary text-primary" : "fill-line text-line"} />
                  ))}
                </span>
                <span>& Up</span>
              </label>
            ))}
            <label className="flex min-h-[34px] cursor-pointer items-center gap-2 py-1 [&>input]:accent-primary">
              <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} />
              <span>Any rating</span>
            </label>
          </div>

          {hasFilters ? (
            <button type="button" className="btn btn-outline mt-2 w-full" onClick={resetFilters}>
              Clear all filters
            </button>
          ) : null}
        </aside>
        {filtersOpen && (
          <div className="fixed inset-0 z-[45] bg-black/50 md:hidden" onClick={() => setFiltersOpen(false)} />
        )}

        <section className="min-w-0">
          <div className="mb-[18px] flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between [&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:tracking-tight sm:[&_h1]:text-[26px]">
            <div>
              <h1>{title}</h1>
              <span className="text-muted">
                {results.length} {results.length === 1 ? "product" : "products"}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline md:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={16} /> Filters
              </button>
              <select
                className="input min-w-0 flex-1 sm:w-auto sm:flex-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort by"
              >
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {status === "loading" ? (
            <div className="py-16 text-center text-muted">Loading products...</div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-danger">Could not load products: {error}</p>
              <button type="button" className="btn btn-outline" onClick={reload}>
                Try again
              </button>
            </div>
          ) : results.length ? (
            <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] md:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} showBrand={false} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 px-4 py-16 text-center [&>h3]:text-base [&>h3]:font-bold">
              <h3>No products match your filters</h3>
              <p className="text-muted">Try removing a filter or searching for something else.</p>
              <button type="button" className="btn btn-primary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
