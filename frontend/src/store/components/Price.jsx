import { formatMoney } from "../../utils/format";
import { discountPercent, sellingPrice } from "../utils/pricing";

const whole = (value) => formatMoney(value).replace(/\.00$/, "");

const SIZES = {
  sm: { current: "text-sm xs:text-[15px]", old: "text-[0.85em]", off: "text-[11px]" },
  md: { current: "text-base", old: "text-[0.85em]", off: "text-[11px]" },
  lg: { current: "text-[28px]", old: "text-base", off: "text-[13px]" },
};

const Price = ({ product, size = "md", className = "" }) => {
  const off = discountPercent(product);
  const s = SIZES[size];
  return (
    <div className={`flex flex-wrap items-baseline gap-1.5 ${className}`}>
      <span className={`font-bold text-black ${s.current}`}>{whole(sellingPrice(product))}</span>
      {off > 0 && (
        <>
          <span className={`text-muted line-through ${s.old}`}>{whole(product.price)}</span>
          <span className={`rounded bg-primary-soft px-1.5 py-px font-bold text-primary-hover ${s.off}`}>
            {off}% OFF
          </span>
        </>
      )}
    </div>
  );
};

export { whole };
export default Price;
