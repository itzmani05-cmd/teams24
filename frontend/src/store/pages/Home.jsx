import { Link } from "react-router";
import { ArrowRight, Flame } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "../context/CatalogContext";
import { discountPercent } from "../utils/pricing";
import FeatureStrip from "../components/FeatureStrip";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import DealOfTheDay from "../components/DealOfTheDay";
import Newsletter from "../components/Newsletter";
import Price from "../components/Price";

const buildHomeData = (products, categories, brands) => {
  const inStockDeals = products.filter((p) => p.stock > 0 && p.discountPrice);
  const byDiscount = (a, b) => discountPercent(b) - discountPercent(a);

  const featuredProducts = [...products].sort(byDiscount).slice(0, 8);
  const featuredIds = new Set(featuredProducts.map((p) => p.id));
  const dealOfTheDay = [...inStockDeals].sort(byDiscount)[0];

  return {
    featuredProducts,
    dealOfTheDay,
    maxDiscount: products.length ? Math.max(...products.map(discountPercent)) : 0,
    // Best deal per category, so the hero shows a varied mix
    heroProducts: [...inStockDeals]
      .filter((p) => p.id !== dealOfTheDay?.id && p.thumbnail)
      .sort(byDiscount)
      .filter((p, i, list) => list.findIndex((q) => q.category?.slug === p.category?.slug) === i)
      .slice(0, 3),
    promoBanners: categories
      .map((c) => ({ ...c, deal: inStockDeals.filter((p) => p.category?.slug === c.slug).sort(byDiscount)[0] }))
      .filter((c) => c.deal)
      .sort((a, b) => byDiscount(a.deal, b.deal))
      .slice(0, 2),
    bestSellers: products
      .filter((p) => !featuredIds.has(p.id))
      .sort((a, b) => b.reviewCount - a.reviewCount || b.createdAt - a.createdAt)
      .slice(0, 4),
    topBrands: brands
      .map((name) => ({ name, count: products.filter((p) => p.brand === name).length }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 12),
  };
};

const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] xl:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="aspect-[4/3] animate-pulse bg-subtle" />
        <div className="flex flex-col gap-2 p-3">
          <div className="h-3.5 w-4/5 animate-pulse rounded bg-subtle" />
          <div className="h-3.5 w-1/2 animate-pulse rounded bg-subtle" />
          <div className="mt-2 h-9 animate-pulse rounded-lg bg-subtle" />
        </div>
      </div>
    ))}
  </div>
);

const sectionHead = "mb-4 flex items-center justify-between";
const sectionTitle = "text-lg font-bold tracking-tight sm:text-xl";
const sectionLink = "inline-flex items-center gap-1 text-[13px] font-semibold text-primary";
const productGrid = "grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] xl:grid-cols-4";

const Home = () => {
  const { products, categories, brands, status, error, reload } = useCatalog();
  const { featuredProducts, dealOfTheDay, maxDiscount, heroProducts, promoBanners, bestSellers, topBrands } = useMemo(
    () => buildHomeData(products, categories, brands),
    [products, categories, brands],
  );
  const loading = status === "loading";

  return (
    <>
      <div className="page-container pt-4 sm:pt-6">
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary-soft via-[#fff4e8] to-[#fde3cc]">
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-primary/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-white/50" aria-hidden="true" />
          <div className="relative grid items-center gap-8 px-5 py-8 sm:px-10 sm:py-12 md:grid-cols-[1.05fr_1fr] lg:px-14 lg:py-14">
            <div>
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold tracking-wide text-primary shadow-sm">
                <Flame size={14} />
                {maxDiscount > 0 ? `Mega Sale · Up to ${maxDiscount}% off top brands` : "Top brands, great deals"}
              </span>
              <h1 className="text-[34px] leading-[1.08] font-extrabold tracking-[-0.03em] text-ink xs:text-[40px] sm:text-[46px] lg:text-[56px]">
                Everything
                <br />
                You Need,
                <br />
                <span className="text-primary">All in One Place</span>
              </h1>
              <p className="mt-4 mb-7 max-w-[440px] text-[15px] leading-relaxed text-muted">
                Discover top brands, great deals, and a better shopping experience — with free shipping over ₹500 and
                easy 7-day returns.
              </p>
              <div className="flex flex-wrap gap-3 max-sm:[&>a]:flex-1">
                <Link to="/shop" className="btn btn-primary px-6 py-3 shadow-sm">
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link to="/deals" className="btn btn-outline px-6 py-3 font-semibold">
                  View Deals
                </Link>
              </div>
              {categories.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {categories.slice(0, 4).map((c) => (
                    <Link
                      key={c.slug}
                      to={`/shop?category=${c.slug}`}
                      className="rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-medium text-ink hover:border-primary hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {heroProducts.length > 0 && (
              <div className="relative mx-auto w-full max-w-[400px] max-md:hidden md:mr-4">
                <Link
                  to={`/product/${heroProducts[0].slug}`}
                  className="block overflow-hidden rounded-2xl bg-white text-ink shadow-menu transition-transform hover:-translate-y-1"
                >
                  <span className="absolute top-3 left-3 z-[1] rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
                    Hot deal
                  </span>
                  <img
                    src={heroProducts[0].thumbnail}
                    alt={heroProducts[0].name}
                    className="block aspect-[5/4] w-full bg-white object-contain p-8"
                  />
                  <div className="flex items-end justify-between gap-3 border-t border-line px-5 py-4">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{heroProducts[0].name}</div>
                      <Price product={heroProducts[0]} size="sm" />
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary">
                      Shop now <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
                {heroProducts.slice(1).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className={`absolute flex w-[200px] items-center gap-3 rounded-xl bg-white p-2.5 text-ink shadow-menu transition-transform hover:-translate-y-0.5 ${
                      i === 0 ? "top-12 -left-8 lg:-left-14" : "top-[50%] -left-4 lg:-left-8"
                    }`}
                  >
                    <img src={p.thumbnail} alt="" className="size-14 shrink-0 rounded-lg bg-subtle object-contain p-1" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold">{p.name}</div>
                      <div className="text-xs font-bold text-primary">{discountPercent(p)}% off</div>
                    </div>
                  </Link>
                ))}
                {maxDiscount > 0 && (
                  <div
                    className="absolute -top-7 -right-5 z-[2] grid size-[108px] place-items-center content-center rounded-full border-4 border-white bg-primary text-[11px] leading-[1.1] font-bold text-white uppercase shadow-menu lg:size-[120px]"
                    aria-hidden="true"
                  >
                    <span>Up to</span>
                    <strong className="text-[30px] font-extrabold lg:text-[34px]">{maxDiscount}%</strong>
                    <span>Off</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
        <div className="mt-4">
          <FeatureStrip />
        </div>
      </div>

      <div className="page-container">
        {status === "error" && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-danger">
            <span>Could not load products: {error}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={reload}>
              Try again
            </button>
          </div>
        )}
        <section className="mt-7 sm:mt-9">
          <div className={sectionHead}>
            <h2 className={sectionTitle}>Shop by Category</h2>
            <Link to="/categories" className={sectionLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-x-2 gap-y-[18px] sm:grid-cols-6 sm:gap-4">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="group flex flex-col items-center gap-2.5 text-center text-xs font-medium text-ink sm:text-[13px]"
              >
                <span className="grid size-16 place-items-center overflow-hidden rounded-full border border-line bg-subtle text-black transition group-hover:-translate-y-0.5 group-hover:border-primary group-hover:text-primary xs:size-[72px] sm:size-24">
                  {c.image ? (
                    <img src={c.image} alt="" loading="lazy" className="size-full bg-white object-contain p-2.5" />
                  ) : (
                    <CategoryIcon name={c.icon} />
                  )}
                </span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-7 sm:mt-9">
          <div className={sectionHead}>
            <h2 className={sectionTitle}>Featured Products</h2>
            <Link to="/deals" className={sectionLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            <div className={productGrid}>
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 grid gap-[18px] sm:mt-9 md:grid-cols-2">
          {promoBanners.map((c, i) => (
            <Link
              key={c.slug}
              to={`/shop?category=${c.slug}`}
              className={`relative grid min-h-[180px] overflow-hidden rounded-2xl text-white transition hover:-translate-y-0.5 hover:shadow-menu xs:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] sm:min-h-[220px] ${
                i === 0 ? "bg-black" : "bg-primary"
              }`}
            >
              <div className="flex flex-col justify-center gap-2 p-[18px] sm:p-6">
                <span className="text-xs font-bold tracking-[0.08em] uppercase opacity-85">{c.name}</span>
                <h3 className="text-[22px] leading-[1.1] font-extrabold tracking-tight sm:text-[28px]">
                  Up to {discountPercent(c.deal)}% off
                </h3>
                <p className="text-[13px] opacity-85">{c.description}</p>
                <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-black">
                  Shop {c.name} <ArrowRight size={14} />
                </span>
              </div>
              <img src={c.deal.thumbnail} alt="" loading="lazy" className="hidden size-full object-cover xs:block" />
            </Link>
          ))}
        </section>

        {dealOfTheDay && (
          <div className="mt-7 sm:mt-9">
            <DealOfTheDay product={dealOfTheDay} />
          </div>
        )}

        <section className="mt-7 sm:mt-9">
          <div className={sectionHead}>
            <h2 className={sectionTitle}>Best Sellers</h2>
            <Link to="/shop" className={sectionLink}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className={productGrid}>
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 sm:mt-9">
          <div className={sectionHead}>
            <h2 className={sectionTitle}>Top Brands</h2>
            <span className="text-muted">{brands.length} brands</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
            {topBrands.map((b) => (
              <Link
                key={b.name}
                to={`/shop?q=${encodeURIComponent(b.name)}`}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-1.5 py-3 text-center text-ink transition hover:-translate-y-0.5 hover:border-primary sm:px-2.5 sm:py-4"
              >
                <span className="grid size-11 place-items-center rounded-full bg-black text-lg font-extrabold text-primary">
                  {b.name.slice(0, 1)}
                </span>
                <span className="max-w-full truncate font-semibold">{b.name}</span>
                <span className="text-xs text-muted">
                  {b.count} {b.count === 1 ? "product" : "products"}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-7 sm:mt-9">
          <Newsletter />
        </div>
      </div>
    </>
  );
};

export default Home;
