import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useShop } from "../context/ShopContext";

const STYLES = {
  success: { icon: CheckCircle2, color: "text-success" },
  error: { icon: XCircle, color: "text-danger" },
  info: { icon: Info, color: "text-primary" },
};

const Toast = () => {
  const { toast } = useShop();
  if (!toast) return null;
  const { icon: Icon, color } = STYLES[toast.type] || STYLES.success;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4" role="status">
      <div
        key={toast.id}
        className="flex max-w-md items-center gap-2.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white shadow-menu"
      >
        <Icon size={18} className={`shrink-0 ${color}`} />
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
