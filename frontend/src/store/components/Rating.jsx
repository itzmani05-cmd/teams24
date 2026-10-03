import { Star } from "lucide-react";

const Rating = ({ value, count, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(value) ? "fill-primary text-primary" : "fill-line text-line"}
      />
    ))}
    {count !== undefined && <span className="ml-1.5 text-[13px] text-muted">({count} reviews)</span>}
  </span>
);

export default Rating;
