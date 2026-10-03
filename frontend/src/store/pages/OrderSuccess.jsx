import { Link, useParams } from "react-router";
import { Check } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { whole } from "../components/Price";

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const { orders } = useShop();
  const order = orders.find((o) => o.number === orderNumber);
  const itemCount = order ? order.items.reduce((n, i) => n + i.quantity, 0) : 0;

  return (
    <div className="page-container">
      <div className="mx-auto mt-7 flex max-w-[460px] flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-7 text-center sm:mt-14 sm:px-8 sm:py-10 [&>h1]:text-[22px] [&>h1]:font-bold sm:[&>h1]:text-[26px]">
        <div className="grid size-[84px] place-items-center rounded-full bg-success-soft text-success">
          <Check size={36} strokeWidth={3} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className="text-muted">Thank you for your purchase. Your order has been placed and is being processed.</p>
        <div className="my-3 flex flex-col gap-0.5 [&>strong]:text-xl">
          <span className="text-muted">Order Number</span>
          <strong>#{orderNumber}</strong>
          {order && (
            <span className="text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"} · {whole(order.total)}
            </span>
          )}
        </div>
        <Link to="/shop" className="btn btn-primary w-full p-3">
          Continue Shopping
        </Link>
        <Link to={`/account/orders/${orderNumber}`} className="btn btn-outline-primary w-full p-3">
          View Order Details
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
