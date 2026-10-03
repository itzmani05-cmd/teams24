import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { Heart, LogOut, MapPin, Package, Pencil, Plus, Settings, Trash2, User } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { storeApi } from "../api";
import ProductCard from "../components/ProductCard";
import AddressForm from "../components/AddressForm";
import { whole } from "../components/Price";
import { formatDate } from "../../utils/format";

const STATUS_CLASS = {
  pending: "badge-warning",
  confirmed: "badge-info",
  processing: "badge-info",
  shipped: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-danger",
  returned: "badge-danger",
};

const StatusBadge = ({ status }) => <span className={`badge ${STATUS_CLASS[status] || ""}`}>{status}</span>;

const linkBtn = "inline-flex cursor-pointer items-center gap-1 font-medium text-primary hover:underline";

const PAYMENT_LABELS = { card: "Credit / Debit Card", upi: "UPI", cod: "Cash on Delivery" };

const LINKS = [
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/settings", label: "Settings", icon: Settings },
];

const accountLinkBase =
  "flex min-h-[38px] shrink-0 cursor-pointer items-center gap-2.5 rounded-full border px-3 py-2 whitespace-nowrap md:rounded-lg";

const accountLinkClass = ({ isActive }) =>
  `${accountLinkBase} ${
    isActive
      ? "border-primary bg-primary-soft font-semibold text-primary-hover md:border-transparent"
      : "border-line text-ink hover:bg-canvas md:border-transparent"
  }`;

export const AccountLayout = () => {
  const { user, authReady, logout } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  if (!authReady) return <div className="page-container py-16 text-center text-muted">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="page-container grid items-start gap-4 pt-7 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
      <aside className="min-w-0 rounded-xl border border-line bg-surface p-3 md:sticky md:top-[84px] md:p-[18px] [&>h3]:hidden [&>h3]:text-base [&>h3]:font-bold md:[&>h3]:block">
        <h3>My Account</h3>
        <div className="mb-2.5 flex items-center gap-2.5 border-b border-line pb-2.5 text-[13px] md:my-3.5 md:pb-3.5 [&>div]:min-w-0 [&_.text-muted]:truncate">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black text-[13px] font-bold text-primary">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>{user.name}</strong>
            <div className="text-muted">{user.email}</div>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto md:flex-col md:gap-0.5">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={accountLinkClass}>
              <Icon size={16} /> {label}
            </NavLink>
          ))}
          <button
            type="button"
            className={`${accountLinkBase} border-line text-danger hover:bg-canvas md:border-transparent`}
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </aside>
      <section className="min-w-0 [&>h2]:mb-4 [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl">
        <Outlet />
      </section>
    </div>
  );
};

const panel = "mb-4 rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold";
const emptyBox =
  "flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary";
const titleRow =
  "mb-4 flex flex-wrap items-center justify-between gap-3 [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl";
const summaryRows =
  "mb-4 [&>div]:flex [&>div]:justify-between [&>div]:py-[7px] [&_dd]:m-0 [&_dd]:font-medium [&_dt]:text-muted";
const summaryTotal =
  "mt-1.5 border-t border-line pt-3 text-base [&_dd]:font-extrabold [&_dt]:font-bold [&_dt]:text-ink";

const money = (value) => whole(Number(value));
const addressLine = (a) => [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean).join(", ");

const useApi = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await storeApi.get(path));
    } catch (err) {
      setError(err.message);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, reload: load, setData };
};

const Loading = ({ error }) =>
  error ? <p className="text-danger">{error}</p> : <p className="py-6 text-muted">Loading...</p>;

export const MyOrders = () => {
  const { data, error } = useApi("/orders?limit=50");

  return (
    <>
      <h2>My Orders</h2>
      {!data ? (
        <Loading error={error} />
      ) : data.items.length === 0 ? (
        <div className={emptyBox}>
          <Package size={32} />
          <h3>No orders yet</h3>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col rounded-xl border border-line bg-surface">
          {data.items.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[1fr_auto] items-center gap-2.5 border-b border-line p-3.5 last:border-b-0 max-sm:[&>.btn]:col-span-2 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-[18px] sm:px-[18px]"
            >
              <div className="hidden gap-1.5 sm:flex [&>img]:size-[52px] [&>img]:rounded-lg [&>img]:object-cover">
                {o.items.map((i) =>
                  i.product?.thumbnailUrl ? (
                    <img key={i.id} src={i.product.thumbnailUrl} alt="" />
                  ) : (
                    <span key={i.id} className="size-[52px] rounded-lg bg-subtle" />
                  ),
                )}
              </div>
              <div className="flex flex-col gap-0.5 text-[13px]">
                <strong>#{o.orderNumber}</strong>
                <span className="text-muted">Placed on {formatDate(o.createdAt)}</span>
                <span className="text-muted">
                  {o._count.items} {o._count.items === 1 ? "item" : "items"} · {money(o.totalAmount)}
                </span>
              </div>
              <StatusBadge status={o.orderStatus} />
              <Link to={`/account/orders/${o.id}`} className="btn btn-outline btn-sm">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export const OrderDetails = () => {
  const { orderId } = useParams();
  const { notify, refreshCart } = useShop();
  const { data: order, error, setData } = useApi(`/orders/${orderId}`);
  const [cancelling, setCancelling] = useState(false);

  if (!order) {
    return error ? (
      <div className={emptyBox}>
        <h3>Order not found</h3>
        <Link to="/account/orders" className="btn btn-primary">
          Back to orders
        </Link>
      </div>
    ) : (
      <Loading />
    );
  }

  const cancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      setData(await storeApi.post(`/orders/${order.id}/cancel`));
      notify("Order cancelled");
      refreshCart();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  const a = order.address;
  const canCancel = ["pending", "confirmed"].includes(order.orderStatus);

  return (
    <>
      <div className={titleRow}>
        <h2>Order #{order.orderNumber}</h2>
        <StatusBadge status={order.orderStatus} />
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">Placed on {formatDate(order.createdAt)}</p>
        {canCancel && (
          <button type="button" className="btn btn-outline btn-sm text-danger" onClick={cancel} disabled={cancelling}>
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className={panel}>
          <h4>Items</h4>
          {order.items.map((i) => (
            <div
              key={i.id}
              className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-line py-2.5 last:border-b-0"
            >
              {i.product?.thumbnailUrl ? (
                <img src={i.product.thumbnailUrl} alt="" className="size-[52px] rounded-lg object-cover" />
              ) : (
                <span className="size-[52px] rounded-lg bg-subtle" />
              )}
              <div>
                {i.product?.slug ? (
                  <Link to={`/product/${i.product.slug}`} className="text-ink hover:text-muted">
                    {i.productName}
                  </Link>
                ) : (
                  <div>{i.productName}</div>
                )}
                <div className="text-muted">
                  {money(i.productPrice)} × {i.quantity}
                </div>
              </div>
              <strong>{money(i.subtotal)}</strong>
            </div>
          ))}
        </div>
        <div className={panel}>
          <h4>Delivery Address</h4>
          {a && (
            <p className="mb-3 text-muted">
              {a.fullName}
              <br />
              {addressLine(a)}
              <br />
              {a.phone}
            </p>
          )}
          <h4>Payment</h4>
          <p className="mb-3 text-muted">
            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} ·{" "}
            <span className="capitalize">{order.paymentStatus}</span>
          </p>
          <dl className={summaryRows}>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd className="text-success">-{money(order.discountAmount)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{Number(order.shippingAmount) ? money(order.shippingAmount) : "Free"}</dd>
            </div>
            <div className={summaryTotal}>
              <dt>Total</dt>
              <dd>{money(order.totalAmount)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export const Profile = () => {
  const { user, updateProfile, notify } = useShop();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || null });
      notify("Profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2>Profile</h2>
      <form className={`${panel} max-w-[480px]`} onSubmit={handleSubmit}>
        {error && <div className="alert-error">{error}</div>}
        <div className="field">
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-phone">Phone</label>
          <input
            id="profile-phone"
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" className="input" value={user.email} disabled />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </>
  );
};

export const Addresses = () => {
  const { notify } = useShop();
  const { data: addresses, error, reload } = useApi("/addresses");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const create = async (address) => {
    await storeApi.post("/addresses", address);
    await reload();
    setAdding(false);
    notify("Address saved");
  };

  const update = async (id, address) => {
    await storeApi.patch(`/addresses/${id}`, address);
    await reload();
    setEditingId(null);
    notify("Address updated");
  };

  const makeDefault = async (id) => {
    try {
      await storeApi.patch(`/addresses/${id}`, { isDefault: true });
      await reload();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await storeApi.delete(`/addresses/${id}`);
      await reload();
      notify("Address deleted");
    } catch (err) {
      notify(err.message, "error");
    }
  };

  if (!addresses) return <Loading error={error} />;

  return (
    <>
      <div className={titleRow}>
        <h2>Addresses</h2>
        {!adding && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>
      {adding && (
        <div className={panel}>
          <AddressForm onSubmit={create} onCancel={() => setAdding(false)} />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) =>
          editingId === a.id ? (
            <div key={a.id} className={`${panel} sm:col-span-2`}>
              <AddressForm
                initial={a}
                onSubmit={(changes) => update(a.id, changes)}
                onCancel={() => setEditingId(null)}
                submitLabel="Update Address"
              />
            </div>
          ) : (
            <div key={a.id} className={panel}>
              <div className="flex items-center gap-2 font-semibold">
                {a.fullName} {a.isDefault && <span className="badge">Default</span>}
              </div>
              <div className="text-muted">{addressLine(a)}</div>
              <div className="text-muted">
                {a.country} · {a.phone}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <button type="button" className={linkBtn} onClick={() => setEditingId(a.id)}>
                  <Pencil size={14} /> Edit
                </button>
                {!a.isDefault && (
                  <button type="button" className={linkBtn} onClick={() => makeDefault(a.id)}>
                    Set as default
                  </button>
                )}
                <button type="button" className={`${linkBtn} text-danger`} onClick={() => remove(a.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
      {addresses.length === 0 && !adding && <p className="text-muted">No saved addresses yet.</p>}
    </>
  );
};

export const Wishlist = () => {
  const { wishlistItems } = useShop();

  return (
    <>
      <h2>Wishlist</h2>
      {wishlistItems.length === 0 ? (
        <div className={emptyBox}>
          <Heart size={32} />
          <h3>Your wishlist is empty</h3>
          <p className="text-muted">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
};

export const AccountSettings = () => {
  const { changePassword, notify } = useShop();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match");
    setSaving(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      notify("Password changed");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h2>Settings</h2>
      <form className={`${panel} max-w-[480px]`} onSubmit={handleSubmit}>
        <h4>Change password</h4>
        {error && <div className="alert-error">{error}</div>}
        {[
          ["currentPassword", "Current password", "current-password"],
          ["newPassword", "New password", "new-password"],
          ["confirmPassword", "Confirm new password", "new-password"],
        ].map(([name, label, autoComplete]) => (
          <div key={name} className="field">
            <label htmlFor={`settings-${name}`}>{label}</label>
            <input
              id={`settings-${name}`}
              className="input"
              type="password"
              name={name}
              value={form[name]}
              onChange={handleChange}
              autoComplete={autoComplete}
              minLength={name === "currentPassword" ? 1 : 8}
              maxLength={72}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Change Password"}
        </button>
      </form>
    </>
  );
};
