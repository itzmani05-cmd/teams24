import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { storeApi } from "../api";
import { Banknote, Check, CreditCard, Plus, Smartphone } from "lucide-react";
import { useShop } from "../context/ShopContext";
import OrderSummary from "../components/OrderSummary";
import AddressForm from "../components/AddressForm";

const STEPS = ["Shipping", "Payment", "Review"];

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / Debit Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "cod", label: "Cash on Delivery", icon: Banknote },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user, authReady, availableItems, totals, placeOrder } = useShop();
  const [addresses, setAddresses] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [showForm, setShowForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    storeApi
      .get("/addresses")
      .then((list) => {
        setAddresses(list);
        setAddressId(list.find((a) => a.isDefault)?.id || list[0]?.id || null);
        setShowForm(list.length === 0);
      })
      .catch((err) => setError(err.message));
  }, [user]);

  if (!authReady) return <div className="page-container py-16 text-center text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  if (!availableItems.length && !placing) return <Navigate to="/cart" replace />;
  if (!addresses) {
    return <div className="page-container py-16 text-center text-muted">{error || "Loading your addresses..."}</div>;
  }

  const step = !addressId ? 0 : paymentMethod ? 2 : 1;

  const handleAddAddress = async (address) => {
    const created = await storeApi.post("/addresses", address);
    const list = await storeApi.get("/addresses");
    setAddresses(list);
    setAddressId(created.id);
    setShowForm(false);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError("");
    try {
      const order = await placeOrder({ addressId, paymentMethod });
      navigate(`/order-success/${order.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  return (
    <div className="page-container">
      <ol className="my-5 flex list-none justify-center gap-2.5 p-0 text-xs xs:gap-4 xs:text-[13px] sm:my-7 sm:gap-12 sm:text-sm [&>li]:flex [&>li]:items-center [&>li]:gap-2 [&>li]:font-medium [&>li]:text-muted [&>li.current]:text-ink [&>li.done]:text-ink">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? "done" : i === step ? "current" : ""}>
            <span className="grid size-[22px] place-items-center rounded-full border border-line bg-surface text-xs xs:size-[26px] [li.current_&]:border-primary [li.current_&]:bg-primary [li.current_&]:text-white [li.done_&]:border-primary [li.done_&]:bg-primary [li.done_&]:text-white">
              {i < step ? <Check size={12} /> : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5 [&>h3]:mb-3.5 [&>h3]:text-base [&>h3]:font-bold">
            <h3>Shipping Address</h3>
            <div className="mb-3 flex flex-col gap-2.5">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[10px] border p-3.5 leading-normal [&>input]:mt-1 [&>input]:accent-primary ${addressId === a.id ? "border-primary bg-primary-soft" : "border-line"}`}
                >
                  <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {a.fullName} {a.isDefault && <span className="badge">Default</span>}
                    </div>
                    <div className="text-muted">
                      {[a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
                    </div>
                    <div className="text-muted">{a.phone}</div>
                  </div>
                </label>
              ))}
            </div>
            {showForm ? (
              <AddressForm onSubmit={handleAddAddress} onCancel={addresses.length ? () => setShowForm(false) : null} />
            ) : (
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line p-3 font-medium text-primary hover:border-primary"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} /> Add New Address
              </button>
            )}
          </section>

          <section className="rounded-xl border border-line bg-surface p-4 sm:p-5 [&>h3]:mb-3.5 [&>h3]:text-base [&>h3]:font-bold">
            <h3>Payment Method</h3>
            <div className="mb-3 flex flex-col gap-2.5">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-[10px] border p-3.5 leading-normal [&>input]:accent-primary ${paymentMethod === value ? "border-primary bg-primary-soft" : "border-line"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <Icon size={18} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <OrderSummary totals={totals} items={availableItems}>
          {error && <div className="alert-error">{error}</div>}
          <button
            type="button"
            className="btn btn-primary w-full p-3"
            disabled={!addressId || placing}
            onClick={handlePlaceOrder}
          >
            {placing ? "Placing order..." : "Place Order"}
          </button>
          <Link to="/cart" className="mt-3 block text-center font-medium">
            Back to cart
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
};

export default Checkout;
