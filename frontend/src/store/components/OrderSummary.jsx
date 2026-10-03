import { whole } from "./Price";

const OrderSummary = ({ totals, children, items }) => (
  <aside className="rounded-xl border border-line bg-surface p-4 sm:p-5 md:sticky md:top-[84px]">
    <h3 className="mb-3.5 text-base font-bold">Order Summary</h3>
    {items && (
      <ul className="mb-2">
        {items.map((i) => (
          <li key={i.key} className="grid grid-cols-[40px_1fr_auto_auto] items-center gap-2.5 py-2 text-[13px]">
            <img src={i.product.thumbnail} alt="" className="size-10 rounded-md object-cover" />
            <span className="truncate">{i.product.name}</span>
            <span className="text-muted">×{i.quantity}</span>
            <span>{whole((i.product.discountPrice ?? i.product.price) * i.quantity)}</span>
          </li>
        ))}
      </ul>
    )}
    <dl className="mb-4 [&>div]:flex [&>div]:justify-between [&>div]:py-[7px] [&_dd]:m-0 [&_dd]:font-medium [&_dt]:text-muted">
      <div>
        <dt>Subtotal</dt>
        <dd>{whole(totals.subtotal)}</dd>
      </div>
      <div>
        <dt>Discount</dt>
        <dd className="text-success">-{whole(totals.discount)}</dd>
      </div>
      <div>
        <dt>Shipping</dt>
        <dd>{totals.shipping ? whole(totals.shipping) : "Free"}</dd>
      </div>
      <div className="mt-1.5 border-t border-line pt-3 text-base [&_dd]:font-extrabold [&_dt]:font-bold [&_dt]:text-ink">
        <dt>Total</dt>
        <dd>{whole(totals.total)}</dd>
      </div>
    </dl>
    {children}
  </aside>
);

export default OrderSummary;
