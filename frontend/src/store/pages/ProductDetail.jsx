import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { BadgeCheck, Heart, Star } from "lucide-react";
import { normalizeProduct, storeApi } from "../api";
import { useCatalog } from "../context/CatalogContext";
import { useShop } from "../context/ShopContext";
import Breadcrumbs from "../components/Breadcrumbs";
import Rating from "../components/Rating";
import Price from "../components/Price";
import QuantityStepper from "../components/QuantityStepper";
import FeatureStrip from "../components/FeatureStrip";
import ProductCard from "../components/ProductCard";
import { formatDate } from "../../utils/format";

const TABS = ["Description", "Specifications", "Reviews"];

const emptyState =
  "page-container flex flex-col items-center gap-2.5 py-16 text-center [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2";

const ProductDetail = () => {
  const { slug } = useParams();
  const { findProduct, status } = useCatalog();
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("loading");

  const load = useCallback(async () => {
    try {
      setDetail(normalizeProduct(await storeApi.get(`/products/${slug}`)));
      setState("ready");
    } catch {
      setState("missing");
    }
  }, [slug]);

  useEffect(() => {
    setDetail(null);
    setState("loading");
    load();
  }, [load]);

  const product = detail ?? findProduct(slug);

  if (!product) {
    if (state === "missing" || (status === "ready" && state !== "loading")) {
      return (
        <div className={emptyState}>
          <h3>Product not found</h3>
          <p className="text-muted">It may have been removed or the link is wrong.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to shop
          </Link>
        </div>
      );
    }
    return <div className="page-container py-16 text-center text-muted">Loading product...</div>;
  }

  return <ProductView key={product.id} product={product} onReviewed={load} />;
};

const ProductView = ({ product, onReviewed }) => {
  const navigate = useNavigate();
  const { products } = useCatalog();
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(TABS[0]);
  const [busy, setBusy] = useState(false);

  const outOfStock = product.stock === 0;
  const wished = isWishlisted(product.id);
  const related = products
    .filter((p) => p.category?.slug === product.category?.slug && p.id !== product.id)
    .slice(0, 4);
  const mainImage = product.images[activeImage] || product.thumbnail;

  const add = async () => {
    setBusy(true);
    await addToCart(product.id, quantity);
    setBusy(false);
  };

  const buyNow = async () => {
    setBusy(true);
    const ok = await addToCart(product.id, quantity);
    setBusy(false);
    if (ok) navigate("/checkout");
  };

  const specs = [
    ["Brand", product.brand || "-"],
    ["Category", product.category?.name || "-"],
    ["SKU", product.sku || "-"],
    ["Availability", outOfStock ? "Out of stock" : `${product.stock} in stock`],
  ];

  return (
    <div className="page-container">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          ...(product.category
            ? [{ label: product.category.name, to: `/shop?category=${product.category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-7 md:grid-cols-[minmax(0,460px)_1fr] lg:gap-12">
        <div className="mx-auto grid w-full max-w-[560px] gap-3 md:sticky md:top-[84px] md:mx-0 md:max-w-none md:grid-cols-[76px_1fr] md:self-start">
          <div className="order-2 flex gap-2.5 overflow-x-auto md:order-none md:flex-col md:overflow-visible [&>button]:w-[72px] [&>button]:shrink-0 [&>button]:cursor-pointer [&>button]:overflow-hidden [&>button]:rounded-[10px] [&>button]:border-2 [&>button]:border-transparent md:[&>button]:w-auto [&>button.active]:border-primary [&_img]:block [&_img]:aspect-square [&_img]:w-full [&_img]:object-cover">
            {product.images.length > 1 &&
              product.images.map((src, i) => (
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
          <div
            className={`aspect-square overflow-hidden rounded-[14px] bg-subtle [&>img]:block [&>img]:size-full [&>img]:object-cover ${
              product.images.length > 1 ? "" : "md:col-span-2"
            }`}
          >
            {mainImage && <img src={mainImage} alt={product.name} />}
          </div>
        </div>

        <div className="flex flex-col gap-3 [&>h1]:text-[22px] [&>h1]:font-bold [&>h1]:tracking-tight sm:[&>h1]:text-[26px]">
          {product.brand && (
            <span className="text-[13px] font-semibold tracking-wide text-primary uppercase">{product.brand}</span>
          )}
          <h1>{product.name}</h1>
          <Rating value={product.rating} count={product.reviewCount} />
          <Price product={product} size="lg" />
          {product.description && <p className="leading-relaxed text-muted">{product.description}</p>}

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
            <button type="button" className="btn btn-primary" disabled={outOfStock || busy} onClick={add}>
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button type="button" className="btn btn-outline-primary" disabled={outOfStock || busy} onClick={buyNow}>
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
            {product.description || "No description available."} Every order is covered by our 7-day easy returns and
            secure payments.
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

        {tab === "Reviews" && <ProductReviews productId={product.id} onReviewed={onReviewed} />}
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

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1" role="radiogroup" aria-label="Your rating">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        role="radio"
        aria-checked={value === n}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        onClick={() => onChange(n)}
        className="cursor-pointer p-0.5"
      >
        <Star size={24} className={n <= value ? "fill-primary text-primary" : "fill-line text-line"} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId, onReviewed }) => {
  const { user } = useShop();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await storeApi.get(`/products/${productId}/reviews`, { limit: 50 }));
    } catch (err) {
      setError(err.message);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setFormError("Please choose a star rating");
    setSubmitting(true);
    setFormError("");
    try {
      await storeApi.post("/reviews", { productId, rating, comment: comment.trim() || null });
      setSubmitted(true);
      setRating(0);
      setComment("");
      await Promise.all([load(), onReviewed()]);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p className="mt-4 text-danger">Could not load reviews: {error}</p>;
  if (!data) return <p className="mt-4 text-muted">Loading reviews...</p>;

  const { summary, items } = data;

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-extrabold">{summary.average ?? "–"}</span>
          <span className="pb-1 text-muted">out of 5</span>
        </div>
        <Rating value={summary.average} count={summary.count} />
        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const count = summary.breakdown[n] || 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-3">{n}</span>
                <Star size={12} className="fill-primary text-primary" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${summary.count ? (count / summary.count) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 rounded-xl border border-line p-4">
          {submitted ? (
            <p className="font-medium text-success">Thanks! Your review has been posted.</p>
          ) : user ? (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <span className="font-semibold">Write a review</span>
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                className="input min-h-20 resize-y"
                placeholder="What did you like or dislike? (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
              />
              {formError && <div className="alert-error mb-0">{formError}</div>}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Posting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <p className="text-muted">
              <Link to="/login" state={{ from: location.pathname }} className="font-semibold">
                Log in
              </Link>{" "}
              to write a review.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {items.length === 0 ? (
          <p className="py-4 text-muted">No reviews yet. Be the first to review this product.</p>
        ) : (
          items.map((r) => (
            <div key={r.id} className="border-b border-line py-4 first:pt-0 last:border-b-0 [&>p]:mt-1.5">
              <div className="mb-1 flex flex-wrap items-center gap-2.5">
                <strong>{r.user?.name || "Customer"}</strong>
                {r.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                    <BadgeCheck size={14} /> Verified purchase
                  </span>
                )}
                <span className="text-muted">{formatDate(r.createdAt)}</span>
              </div>
              <Rating value={r.rating} size={13} />
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
