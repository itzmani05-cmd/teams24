import { Link } from "react-router";
import { ArrowRight, Flame, Star } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "../context/CatalogContext";
import { discountPercent } from "../utils/pricing";
import { HERO_SLIDE_INTERVAL, heroSlides } from "../data/heroSlides";
import FeatureStrip from "../components/FeatureStrip";
import ProductCard from "../components/ProductCard";
import CategoryIcon from "../components/CategoryIcon";
import HeroBackground from "../components/HeroBackground";
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
    spotlight: inStockDeals
      .filter((p) => p.id !== dealOfTheDay?.id)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || byDiscount(a, b))[0],
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
  const { featuredProducts, dealOfTheDay, maxDiscount, spotlight, promoBanners, bestSellers, topBrands } = useMemo(
    () => buildHomeData(products, categories, brands),
    [products, categories, brands],
  );
  const loading = status === "loading";

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-104px)] flex-col overflow-hidden bg-black sm:min-h-[calc(100svh-64px)]">
        <HeroBackground images={heroSlides} interval={HERO_SLIDE_INTERVAL} />
        <div className="page-container relative z-[1] order-0 grid flex-1 items-center gap-5 py-6 sm:grid-cols-2 sm:gap-6 md:grid-cols-[1.1fr_1fr] md:gap-8 md:py-10 laptop-short:pt-[22px] laptop-short:pb-[18px] max-sm:short:gap-3.5 max-sm:short:pt-[18px] max-sm:short:pb-4 max-sm:tiny:pt-3 max-sm:tiny:pb-3">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary bg-black px-3 py-1.5 text-[11px] font-bold tracking-wide text-primary sm:mb-[18px] sm:text-xs laptop-short:mb-3 max-sm:short:mb-2">
              <Flame size={14} />{" "}
              {maxDiscount > 0 ? `Mega Sale · Up to ${maxDiscount}% off top brands` : "Top brands, great deals"}
            </span>
            <h1 className="text-[34px] leading-[1.1] font-extrabold tracking-[-0.03em] text-white xs:text-[40px] sm:text-[44px] md:text-[52px] lg:text-6xl">
              Everything
              <br />
              You Need,
              <br />
              All in One Place
            </h1>
            <p className="my-3 max-w-[460px] text-[15px] text-smoke sm:mt-4 sm:mb-6 laptop-short:mt-3 laptop-short:mb-[18px] max-sm:short:mt-2 max-sm:short:mb-3.5">
              Discover top brands, great deals, and a better shopping experience — with free shipping over ₹500 and easy
              7-day returns.
            </p>
            <div className="flex flex-wrap gap-3 max-sm:[&>a]:flex-1">
              <Link to="/shop" className="btn btn-primary px-[22px] py-3">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link
                to="/deals"
                className="btn border-white bg-transparent px-[22px] py-3 font-semibold text-white hover:bg-white hover:text-black"
              >
                View Deals
              </Link>
            </div>
          </div>
          <div className="absolute top-3 right-4 max-sm:tiny:hidden sm:relative sm:top-auto sm:right-auto sm:flex sm:items-center sm:justify-end">
            <div className="relative sm:w-[230px] md:w-[260px] lg:w-[300px]">
              {spotlight && (
                <Link
                  to={`/product/${spotlight.slug}`}
                  className="hidden overflow-hidden rounded-2xl bg-surface text-ink shadow-menu transition-transform hover:-translate-y-1 sm:block"
                >
                  <span className="absolute top-3 left-3 z-[1] rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
                    Top rated deal
                  </span>
                  <img
                    src={spotlight.thumbnail}
                    alt={spotlight.name}
                    className="block aspect-[4/3] w-full bg-subtle object-cover"
                  />
                  <div className="flex flex-col gap-1.5 px-4 pt-3.5 pb-4">
                    <span className="leading-snug font-semibold">{spotlight.name}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Star size={13} className="fill-primary text-primary" /> {spotlight.rating} ·{" "}
                      {spotlight.reviewCount} reviews
                    </span>
                    <Price product={spotlight} size="sm" />
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                      Shop now <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              )}
              {maxDiscount > 0 && (
                <div
                  className="z-[2] grid size-[72px] place-items-center content-center rounded-full border-[3px] border-white bg-primary text-[9px] leading-[1.1] font-bold text-white uppercase shadow-menu sm:absolute sm:-top-[26px] sm:-right-[18px] sm:size-[104px] sm:border-4 sm:text-[11px] lg:-top-[34px] lg:-right-[34px] lg:size-[132px]"
                  aria-hidden="true"
                >
                  <span>Up to</span>
                  <strong className="text-[19px] font-extrabold sm:text-[28px] lg:text-4xl">{maxDiscount}%</strong>
                  <span>Off</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="page-container relative z-[1] order-2 pb-4 sm:pb-6">
          <FeatureStrip hero />
        </div>
      </section>

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
                <span className="grid size-14 place-items-center rounded-full border border-line bg-surface text-black transition group-hover:-translate-y-0.5 group-hover:border-primary group-hover:bg-primary-soft group-hover:text-primary xs:size-16 sm:size-[84px]">
                  <CategoryIcon name={c.icon} />
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
