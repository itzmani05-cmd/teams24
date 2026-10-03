import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router";
import { Heart, LogOut, MapPin, Package, Plus, Settings, Trash2, User } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { products } from "../data/catalog";
import ProductCard from "../components/ProductCard";
import AddressForm from "../components/AddressForm";
import { whole } from "../components/Price";
import { formatDate } from "../../utils/format";

const STATUS_CLASS = {
  pending: "badge-warning",
  processing: "badge-warning",
  shipped: "badge-primary",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

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
  const { user, logout } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

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

export const MyOrders = () => {
  const { orders } = useShop();

  return (
    <>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
          <Package size={32} />
          <h3>No orders yet</h3>
          <Link to="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col rounded-xl border border-line bg-surface">
          {orders.map((o) => (
            <div
              key={o.number}
              className="grid grid-cols-[1fr_auto] items-center gap-2.5 border-b border-line p-3.5 last:border-b-0 max-sm:[&>.btn]:col-span-2 sm:grid-cols-[auto_1fr_auto_auto] sm:gap-[18px] sm:px-[18px]"
            >
              <div className="hidden gap-1.5 sm:flex [&>img]:size-[52px] [&>img]:rounded-lg [&>img]:object-cover">
                {o.items.slice(0, 2).map((i) => (
                  <img key={i.productId + (i.size || "") + (i.color || "")} src={i.thumbnail} alt="" />
                ))}
              </div>
              <div className="flex flex-col gap-0.5 text-[13px]">
                <strong>#{o.number}</strong>
                <span className="text-muted">Placed on {formatDate(o.placedAt)}</span>
                <span className="text-muted">
                  {o.items.reduce((n, i) => n + i.quantity, 0)} items · {whole(o.total)}
                </span>
              </div>
              <span className={`badge ${STATUS_CLASS[o.status] || ""}`}>{o.status}</span>
              <Link to={`/account/orders/${o.number}`} className="btn btn-outline btn-sm">
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
  const { orderNumber } = useParams();
  const { orders } = useShop();
  const order = orders.find((o) => o.number === orderNumber);

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
        <h3>Order not found</h3>
        <Link to="/account/orders" className="btn btn-primary">
          Back to orders
        </Link>
      </div>
    );
  }

  const a = order.address;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-[22px] [&>h1]:font-bold [&>h1]:tracking-tight sm:[&>h1]:text-[26px] [&>h1>span]:text-sm [&>h1>span]:font-medium sm:[&>h1>span]:text-base [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl">
        <h2>Order #{order.number}</h2>
        <span className={`badge ${STATUS_CLASS[order.status] || ""}`}>{order.status}</span>
      </div>
      <p className="text-muted">Placed on {formatDate(order.placedAt)}</p>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="mb-4 rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold">
          <h4>Items</h4>
          {order.items.map((i) => (
            <div
              key={i.productId + (i.size || "") + (i.color || "")}
              className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-line py-2.5 last:border-b-0 [&>img]:size-[52px] [&>img]:rounded-lg [&>img]:object-cover"
            >
              <img src={i.thumbnail} alt="" />
              <div>
                <div>{i.name}</div>
                <div className="text-muted">
                  {[i.size && `Size ${i.size}`, i.color, `Qty ${i.quantity}`].filter(Boolean).join(" · ")}
                </div>
              </div>
              <strong>{whole(i.price * i.quantity)}</strong>
            </div>
          ))}
        </div>
        <div className="mb-4 rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold">
          <h4>Delivery Address</h4>
          {a && (
            <p className="text-muted">
              {a.fullName}
              <br />
              {[a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
              <br />
              {a.phone}
            </p>
          )}
          <h4>Payment</h4>
          <p className="text-muted">{PAYMENT_LABELS[order.paymentMethod]}</p>
          <dl className="mb-4 [&>div]:flex [&>div]:justify-between [&>div]:py-[7px] [&_dd]:m-0 [&_dd]:font-medium [&_dt]:text-muted">
            <div>
              <dt>Subtotal</dt>
              <dd>{whole(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd className="text-success">-{whole(order.discount)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{order.shipping ? whole(order.shipping) : "Free"}</dd>
            </div>
            <div className="mt-1.5 border-t border-line pt-3 text-base [&_dd]:font-extrabold [&_dt]:font-bold [&_dt]:text-ink">
              <dt>Total</dt>
              <dd>{whole(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export const Profile = () => {
  const { user, login } = useShop();
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email: user.email, name: name.trim() });
    setSaved(true);
  };

  return (
    <>
      <h2>Profile</h2>
      <form
        className="mb-4 max-w-[480px] rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold"
        onSubmit={handleSubmit}
      >
        {saved && <div className="mb-3.5 rounded-lg bg-primary-soft px-3.5 py-2.5 text-ink">Profile updated.</div>}
        <div className="field">
          <label htmlFor="profile-name">Full name</label>
          <input id="profile-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input id="profile-email" className="input" value={user.email} disabled />
        </div>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </>
  );
};

export const Addresses = () => {
  const { addresses, addAddress, removeAddress } = useShop();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-[22px] [&>h1]:font-bold [&>h1]:tracking-tight sm:[&>h1]:text-[26px] [&>h1>span]:text-sm [&>h1>span]:font-medium sm:[&>h1>span]:text-base [&>h2]:text-lg [&>h2]:font-bold sm:[&>h2]:text-xl">
        <h2>Addresses</h2>
        {!adding && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Add Address
          </button>
        )}
      </div>
      {adding && (
        <div className="mb-4 rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold">
          <AddressForm
            onSubmit={(a) => {
              addAddress(a);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 [&_button]:mt-2">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="mb-4 rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold"
          >
            <div className="flex items-center gap-2 font-semibold">
              {a.label || "Address"} {a.isDefault && <span className="badge">Default</span>}
            </div>
            <div>{a.fullName}</div>
            <div className="text-muted">
              {[a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean).join(", ")}
            </div>
            <div className="text-muted">{a.phone}</div>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 font-medium text-danger hover:underline"
              onClick={() => removeAddress(a.id)}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
      {addresses.length === 0 && !adding && <p className="text-muted">No saved addresses yet.</p>}
    </>
  );
};

export const Wishlist = () => {
  const { wishlist } = useShop();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <h2>Wishlist</h2>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-line bg-surface px-4 py-10 text-center [&>h3]:text-base [&>h3]:font-bold [&>p]:mb-2 [&>svg]:text-primary">
          <Heart size={32} />
          <h3>Your wishlist is empty</h3>
          <p className="text-muted">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:grid-cols-3 sm:gap-[18px] md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
};

export const AccountSettings = () => {
  const [prefs, setPrefs] = useState({ offers: true, orders: true, newsletter: false });
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <h2>Settings</h2>
      <div className="mb-4 max-w-[480px] rounded-xl border border-line bg-surface p-[18px] leading-relaxed [&>h4]:mb-2.5 [&>h4]:font-bold">
        <h4>Notifications</h4>
        {[
          ["orders", "Order updates by email"],
          ["offers", "Deals and offers"],
          ["newsletter", "Weekly newsletter"],
        ].map(([key, label]) => (
          <label key={key} className="mb-3 flex items-center gap-2 [&>input]:accent-primary">
            <input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>
    </>
  );
};
