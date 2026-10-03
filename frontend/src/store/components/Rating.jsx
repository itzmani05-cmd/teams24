import { Star } from "lucide-react";

const Rating = ({ value, count, size = 14 }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={value ? `${value} out of 5` : "No ratings yet"}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={value && n <= Math.round(value) ? "fill-primary text-primary" : "fill-line text-line"}
      />
    ))}
    {count !== undefined && (
      <span className="ml-1.5 text-[13px] text-muted">
        {count ? `(${count} ${count === 1 ? "review" : "reviews"})` : "No reviews yet"}
      </span>
    )}
  </span>
);

export default Rating;
