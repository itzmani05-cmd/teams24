import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { BadgeCheck, Heart } from "lucide-react";
import { findProduct, mockReviews, products } from "../data/catalog";
import { useShop } from "../context/ShopContext";
import Breadcrumbs from "../components/Breadcrumbs";
import Rating from "../components/Rating";
import Price from "../components/Price";
import QuantityStepper from "../components/QuantityStepper";
import FeatureStrip from "../components/FeatureStrip";
import ProductCard from "../components/ProductCard";

const SWATCH_BG = { black: "bg-black", orange: "bg-primary", gray: "bg-muted", white: "bg-white" };

const TABS = ["Description", "Specifications", "Reviews"];

const ProductDetail = () => {
  const { slug } = useParams();
  const product = findProduct(slug);

  if (!product) {
    return (
      <div className="page-container flex flex-col items-center gap-2.5 py-16 text-center [&>h1]:text-[26px] [&>h1]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
        <h3>Product not found</h3>
        <p className="text-muted">It may have been removed or the link is wrong.</p>
        <Link to="/shop" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    );
  }

  return <ProductView key={product.id} product={product} />;
};

const ProductView = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product.colors[0]?.name);
  const [size, setSize] = useState(product.sizes[1] || product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock === 0;
  const wished = isWishlisted(product.id);
  const reviews = mockReviews(product);
  const related = products.filter((p) => p.category.slug === product.category.slug && p.id !== product.id).slice(0, 4);

  const add = () => {
    addToCart(product.id, quantity, { color, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    addToCart(product.id, quantity, { color, size });
    navigate("/checkout");
  };

  const specs = [
    ["Brand", product.brand],
    ["Category", product.category.name],
    ["SKU", product.sku],
    ["Availability", outOfStock ? "Out of stock" : `${product.stock} in stock`],
    ...(product.colors.length ? [["Colors", product.colors.map((c) => c.name).join(", ")]] : []),
    ...(product.sizes.length ? [["Sizes", product.sizes.join(", ")]] : []),
  ];

  return (
    <div className="page-container">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: product.category.name, to: `/shop?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <div className="grid gap-7 md:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div className="mx-auto grid w-full max-w-[560px] gap-3 md:sticky md:top-[84px] md:mx-0 md:max-w-none md:grid-cols-[76px_1fr] md:self-start">
          <div className="order-2 flex gap-2.5 overflow-x-auto md:order-none md:flex-col md:overflow-visible [&>button]:w-[72px] [&>button]:shrink-0 [&>button]:cursor-pointer [&>button]:overflow-hidden [&>button]:rounded-[10px] [&>button]:border-2 [&>button]:border-transparent md:[&>button]:w-auto [&>button.active]:border-primary [&_img]:block [&_img]:aspect-square [&_img]:w-full [&_img]:object-cover">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === activeImage ? "active" : ""}
                onClick={() => setActiveImage(i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-[14px] bg-subtle [&>img]:block [&>img]:aspect-square [&>img]:w-full [&>img]:object-cover">
            <img src={product.images[activeImage]} alt={product.name} />
          </div>
        </div>

        <div className="flex flex-col gap-3 [&>h1]:text-[22px] [&>h1]:font-bold [&>h1]:tracking-tight sm:[&>h1]:text-[26px]">
          <span className="text-[13px] font-semibold tracking-wide text-primary uppercase">{product.brand}</span>
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.reviewCount} />
          <Price product={product} size="lg" />
          <p className="leading-relaxed text-muted">{product.description}</p>

          {product.colors.length > 0 && (
            <div className="mt-1 flex flex-col gap-2">
              <div className="font-medium">
                Color: <strong>{color}</strong>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`size-[30px] cursor-pointer rounded-full border-2 border-white ${SWATCH_BG[c.value]} ${color === c.name ? "ring-2 ring-primary" : "ring-1 ring-line"}`}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-1 flex flex-col gap-2">
              <div className="font-medium">Size:</div>
              <div className="flex flex-wrap gap-2 [&>button]:h-[38px] [&>button]:min-w-11 [&>button]:cursor-pointer [&>button]:rounded-lg [&>button]:border [&>button]:border-line [&>button]:bg-surface [&>button]:px-2.5 [&>button]:font-medium [&>button]:text-ink [&>button:hover]:border-ink [&>button.active]:border-black [&>button.active]:bg-black [&>button.active]:text-white">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={size === s ? "active" : ""}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-1 flex flex-col gap-2">
            <div className="font-medium">
              Quantity:{" "}
              {product.stock > 0 && product.stock <= 5 && (
                <span className="ml-1.5 text-[13px] text-danger">Only {product.stock} left</span>
              )}
            </div>
            <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, product.stock)} />
          </div>

          <div className="mt-2 flex flex-wrap gap-2.5 [&>.btn]:flex-[1_1_calc(50%-32px)] [&>.btn]:p-3 sm:[&>.btn]:flex-1">
            <button type="button" className="btn btn-primary" disabled={outOfStock} onClick={add}>
              {outOfStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
            </button>
            <button type="button" className="btn btn-outline-primary" disabled={outOfStock} onClick={buyNow}>
              Buy Now
            </button>
            <button
              type="button"
              className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white ${wished ? "text-primary [&>svg]:fill-primary" : "text-muted hover:text-primary"}`}
              onClick={() => toggleWishlist(product.id)}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
            >
              <Heart size={18} />
            </button>
          </div>

          <FeatureStrip compact />
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-line bg-surface px-4 pt-1 pb-4 sm:px-6 sm:pb-6">
        <div
          className="no-scrollbar flex gap-6 overflow-x-auto border-b border-line [&>*]:-mb-px [&>*]:shrink-0 [&>*]:cursor-pointer [&>*]:border-b-2 [&>*]:border-transparent [&>*]:py-3.5 [&>*]:font-medium [&>*]:whitespace-nowrap [&>*]:text-muted [&>.active]:border-primary [&>.active]:text-primary"
          role="tablist"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              {t === "Reviews" ? `Reviews (${product.reviewCount})` : t}
            </button>
          ))}
        </div>

        {tab === "Description" && (
          <p className="mt-[18px] leading-[1.7] text-ink">
            {product.description} Every order is covered by our 7-day easy returns and secure payments.
          </p>
        )}

        {tab === "Specifications" && (
          <dl className="mt-3 grid gap-x-8 sm:grid-cols-2 [&>div]:grid [&>div]:grid-cols-[110px_1fr] [&>div]:border-b [&>div]:border-line [&>div]:py-2.5 sm:[&>div]:grid-cols-[120px_1fr] [&_dd]:m-0 [&_dd]:font-medium [&_dt]:text-muted">
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Reviews" && (
          <div className="flex flex-col">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-line py-4 last:border-b-0 [&>p]:mt-1.5">
                <div className="mb-1 flex flex-wrap items-center gap-2.5">
                  <strong>{r.name}</strong>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                      <BadgeCheck size={14} /> Verified purchase
                    </span>
                  )}
                  <span className="text-muted">{r.date}</span>
                </div>
                <Rating value={r.rating} size={13} />
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-7 sm:mt-9">
          <div className="mb-4 flex items-center justify-between [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl">
            <h2>You may also like</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
