import { Link, useNavigate } from "react-router";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { SHIPPING, sellingPrice } from "../data/catalog";
import QuantityStepper from "../components/QuantityStepper";
import OrderSummary from "../components/OrderSummary";
import { whole } from "../components/Price";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, totals, setQuantity, removeFromCart, clearCart } = useShop();

  if (!cartItems.length) {
    return (
      <div className="page-container flex flex-col items-center gap-2.5 py-16 text-center [&>h1]:text-[26px] [&>h1]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
        <ShoppingCart size={40} />
        <h3>Your cart is empty</h3>
        <p className="text-muted">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  const remaining = SHIPPING.freeAbove - (totals.subtotal - totals.discount);

  return (
    <div className="page-container">
      <div className="mt-[18px] mb-3.5 sm:mt-6 sm:mb-[18px] flex flex-wrap items-center justify-between gap-3 [&>h1]:text-[22px] [&>h1]:font-bold [&>h1]:tracking-tight sm:[&>h1]:text-[26px] [&>h1>span]:text-sm [&>h1>span]:font-medium sm:[&>h1>span]:text-base [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl">
        <h1>
          Shopping Cart <span className="text-muted">({totals.count} items)</span>
        </h1>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1 font-medium text-danger hover:underline"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col rounded-xl border border-line bg-surface px-3.5 py-1 sm:px-[18px] sm:py-2">
          {remaining > 0 && (
            <div className="mt-2.5 mb-1 rounded-lg bg-primary-soft px-3.5 py-2.5 text-ink">
              Add <strong>{whole(remaining)}</strong> more to get <strong>free shipping</strong>.
            </div>
          )}
          {cartItems.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-[72px_1fr_auto] items-center gap-x-3 gap-y-2 border-b border-line py-3.5 last:border-b-0 sm:grid-cols-[84px_1fr_auto_110px_auto] sm:gap-4"
            >
              <Link
                to={`/product/${item.product.slug}`}
                className="row-span-2 self-start sm:row-span-1 sm:self-center [&>img]:block [&>img]:size-[72px] [&>img]:rounded-[10px] [&>img]:bg-subtle [&>img]:object-cover sm:[&>img]:size-[84px]"
              >
                <img src={item.product.thumbnail} alt={item.product.name} />
              </Link>
              <div className="col-start-2 row-start-1 min-w-0">
                <Link to={`/product/${item.product.slug}`} className="font-semibold text-ink hover:text-muted">
                  {item.product.name}
                </Link>
                <div className="mt-1 text-[13px] text-muted">
                  {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
                    .filter(Boolean)
                    .join("  ·  ") || item.product.brand}
                </div>
              </div>
              <QuantityStepper
                className="col-start-2 row-start-2 sm:col-start-3 sm:row-start-1"
                size="sm"
                value={item.quantity}
                max={item.product.stock}
                onChange={(q) => setQuantity(item.key, q)}
              />
              <div className="col-start-3 row-start-2 flex flex-col items-end sm:col-start-4 sm:row-start-1">
                <strong>{whole(sellingPrice(item.product) * item.quantity)}</strong>
                {item.product.discountPrice && (
                  <span className="text-[0.85em] text-muted line-through">
                    {whole(item.product.price * item.quantity)}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="col-start-3 row-start-1 -mt-1.5 -mr-2 inline-grid size-[38px] cursor-pointer place-items-center self-start rounded-full text-ink hover:text-primary sm:col-start-5 sm:m-0 sm:self-center"
                onClick={() => removeFromCart(item.key)}
                aria-label={`Remove ${item.product.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <OrderSummary totals={totals}>
          <button type="button" className="btn btn-primary w-full p-3" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
          <Link to="/shop" className="mt-3 block text-center font-medium">
            Continue shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
};

export default Cart;
