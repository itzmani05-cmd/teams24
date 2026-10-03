import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "Free Shipping", text: "On orders over ₹500" },
  { icon: RotateCcw, title: "Easy Returns", text: "7-day hassle free" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% secure" },
  { icon: Headphones, title: "24/7 Support", text: "We're here to help" },
];

const FeatureStrip = ({ compact = false, hero = false }) => {
  const layout = compact
    ? "mt-6 grid-cols-1 sm:grid-cols-3"
    : `grid-cols-1 xs:grid-cols-2 md:grid-cols-4 ${hero ? "max-sm:short:grid-cols-2 max-sm:short:gap-2.5 max-sm:short:p-3" : ""}`;

  return (
    <div
      className={`grid items-center justify-items-center gap-x-3 gap-y-3.5 rounded-lg border border-line bg-surface p-3.5 sm:gap-4 sm:px-5 sm:py-[18px] ${layout}`}
    >
      {(compact ? FEATURES.slice(0, 3) : FEATURES).map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className={`flex items-center justify-center gap-3 text-ink ${hero ? "max-sm:short:gap-2" : ""}`}
        >
          <Icon size={22} className="shrink-0 text-primary" />
          <div>
            <div
              className={`text-[13px] font-semibold ${hero ? "max-sm:short:text-xs max-sm:short:whitespace-nowrap" : ""}`}
            >
              {title}
            </div>
            <div className={`text-xs text-muted ${hero ? "max-sm:short:hidden" : ""}`}>{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureStrip;
