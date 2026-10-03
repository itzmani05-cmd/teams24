import { useState } from "react";
import { Link } from "react-router";
import { Heart, Star } from "lucide-react";
import { useShop } from "../context/ShopContext";
import Price from "./Price";

const ProductCard = ({ product, showBrand = true }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const wished = isWishlisted(product.id);
  const outOfStock = product.stock === 0;
  const [adding, setAdding] = useState(false);

  const add = async () => {
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
  };

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-menu">
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] bg-subtle">
        {product.thumbnail && (
          <img
            src={product.thumbnail}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {outOfStock && (
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black px-2 py-[3px] text-[11px] font-semibold text-white">
            Out of stock
          </span>
        )}
      </Link>
      <button
        type="button"
        className={`absolute top-2.5 right-2.5 grid size-9 cursor-pointer place-items-center rounded-full bg-white shadow-card sm:size-8 ${
          wished ? "text-primary [&>svg]:fill-primary" : "text-muted hover:text-primary"
        }`}
        onClick={() => toggleWishlist(product.id)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wished}
      >
        <Heart size={16} />
      </button>

      <div className="flex flex-1 flex-col gap-[5px] p-2.5 sm:gap-1.5 sm:p-3">
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 text-[13px] leading-[1.35] font-medium text-ink hover:text-muted sm:text-sm"
        >
          {product.name}
        </Link>
        <div className="flex justify-between text-xs">
          <span className="inline-flex items-center gap-[3px] font-semibold text-ink">
            {product.rating ? (
              <>
                <Star size={12} className="fill-primary text-primary" />
                {product.rating}
              </>
            ) : (
              <span className="font-medium text-muted">New</span>
            )}
          </span>
          {showBrand && <span className="text-muted max-xs:hidden">{product.brand}</span>}
        </div>
        <Price product={product} size="sm" className="mb-2" />
        <button
          type="button"
          className="btn btn-primary mt-auto"
          disabled={outOfStock || adding}
          onClick={add}
        >
          {outOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
