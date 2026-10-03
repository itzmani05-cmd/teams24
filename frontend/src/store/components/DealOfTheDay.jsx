import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Clock } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { discountPercent } from "../data/catalog";
import Price from "./Price";
import Rating from "./Rating";

const msUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
};

const pad = (n) => String(n).padStart(2, "0");

const Countdown = () => {
  const [left, setLeft] = useState(msUntilMidnight);

  useEffect(() => {
    const timer = setInterval(() => setLeft(msUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const total = Math.floor(left / 1000);
  const parts = [
    ["Hours", Math.floor(total / 3600)],
    ["Mins", Math.floor((total % 3600) / 60)],
    ["Secs", total % 60],
  ];

  return (
    <div className="flex gap-2.5" aria-label="Time left for this deal">
      {parts.map(([label, value]) => (
        <div
          key={label}
          className="flex min-w-0 flex-1 flex-col items-center rounded-[10px] bg-black px-1.5 py-2 text-white sm:min-w-16 sm:flex-none [&>span]:text-[11px] [&>span]:text-smoke [&>strong]:text-[22px] [&>strong]:tabular-nums"
        >
          <strong>{pad(value)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

const DealOfTheDay = ({ product }) => {
  const { addToCart } = useShop();
  const [added, setAdded] = useState(false);
  const stockLeft = Math.min(product.stock, 99);

  const add = () => {
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <section className="grid overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Link
        to={`/product/${product.slug}`}
        className="relative block min-h-[220px] bg-subtle sm:min-h-[260px] md:min-h-80"
      >
        <img
          src={product.images[1] || product.thumbnail}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1.5 font-extrabold text-white">
          -{discountPercent(product)}%
        </span>
      </Link>
      <div className="flex flex-col gap-2.5 p-[18px] sm:p-7">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold tracking-wide text-primary-hover uppercase">
          <Clock size={14} /> Deal of the Day
        </span>
        <Link
          to={`/product/${product.slug}`}
          className="text-lg leading-tight font-bold text-ink hover:text-muted sm:text-[22px]"
        >
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.reviewCount} />
        <Price product={product} size="lg" />
        <p className="leading-relaxed text-muted">{product.description}</p>
        <div className="mt-1 text-[13px] font-semibold">Ends in</div>
        <Countdown />
        <div className="flex flex-col gap-1.5 text-[13px]">
          <span>
            Only <strong>{stockLeft}</strong> left in stock
          </span>
          <div className="h-1.5 overflow-hidden rounded-full bg-line [&>span]:block [&>span]:h-full [&>span]:rounded-full [&>span]:bg-primary">
            <span style={{ width: `${Math.max(8, Math.min(100, (stockLeft / 100) * 100))}%` }} />
          </div>
        </div>
        <div className="mt-1.5 flex flex-col gap-2.5 xs:flex-row [&>.btn]:flex-1 [&>.btn]:p-3">
          <button type="button" className="btn btn-primary" onClick={add} disabled={product.stock === 0}>
            {added ? "Added to Cart ✓" : "Add to Cart"}
          </button>
          <Link to={`/product/${product.slug}`} className="btn btn-outline-primary">
            View Details
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;
