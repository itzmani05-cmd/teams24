import { Minus, Plus } from "lucide-react";

const QuantityStepper = ({ value, onChange, max = 99, size = "md", className = "" }) => {
  const btn = `grid cursor-pointer place-items-center text-ink disabled:cursor-not-allowed disabled:text-line ${
    size === "sm" ? "size-9 sm:size-[30px]" : "size-9"
  }`;

  return (
    <div className={`inline-flex w-fit items-center rounded-lg border border-line bg-surface ${className}`}>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={14} />
      </button>
      <span className="min-w-8 text-center font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default QuantityStepper;
