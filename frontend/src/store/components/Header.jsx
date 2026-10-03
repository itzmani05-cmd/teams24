import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { categories } from "../data/catalog";
import CategoryIcon from "./CategoryIcon";

const iconBtn =
  "relative inline-grid size-[38px] cursor-pointer place-items-center rounded-full text-white hover:bg-charcoal hover:text-primary";

const countBadge =
  "absolute top-0.5 right-0 min-w-[17px] rounded-full bg-primary px-1 text-center text-[10px] leading-[17px] font-bold text-white";

const navClass = ({ isActive }) => `font-medium ${isActive ? "text-primary" : "text-smoke hover:text-primary"}`;

const menuLinkClass = ({ isActive }) =>
  `flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium ${
    isActive ? "bg-primary-soft text-primary-hover" : "text-ink hover:bg-primary-soft hover:text-primary-hover"
  }`;

const Logo = ({ dark = false }) => (
  <span className={`text-xl font-extrabold tracking-tight whitespace-nowrap ${dark ? "text-black" : "text-white"}`}>
    Teams<span className="text-primary">24</span>
  </span>
);

const Header = () => {
  const { totals, wishlist, user } = useShop();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-20 bg-black text-white">
      <div className="page-container flex flex-wrap items-center gap-2 pt-2 pb-2.5 sm:h-16 sm:flex-nowrap sm:gap-4 sm:py-0 lg:gap-7">
        <button
          type="button"
          className={`${iconBtn} -ml-2 lg:hidden`}
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="inline-flex items-center gap-2 max-sm:text-lg">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-white">
            <ShoppingCart size={16} strokeWidth={2.5} />
          </span>
          <Logo />
        </Link>

        <nav className="hidden gap-[22px] lg:flex">
          <NavLink to="/shop" end className={navClass}>
            Shop
          </NavLink>
          <NavLink to="/categories" className={navClass}>
            Categories
          </NavLink>
          <NavLink to="/deals" className={navClass}>
            Deals
          </NavLink>
        </nav>

        <form
          className="order-3 flex basis-full overflow-hidden rounded-lg bg-white sm:order-none sm:ml-auto sm:max-w-[320px] sm:flex-1 sm:basis-auto"
          onSubmit={handleSearch}
          role="search"
        >
          <input
            type="search"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
            className="min-w-0 flex-1 border-none bg-transparent px-3 py-2 text-base text-ink outline-none sm:py-[9px] sm:text-sm"
          />
          <button type="submit" aria-label="Search" className="cursor-pointer px-3.5 text-muted hover:text-primary">
            <Search size={16} />
          </button>
        </form>

        <div className="ml-auto flex gap-0.5 sm:ml-0 sm:gap-1.5">
          <Link to="/account/wishlist" className={iconBtn} aria-label="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && <span className={countBadge}>{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className={iconBtn} aria-label="Cart">
            <ShoppingCart size={20} />
            {totals.count > 0 && <span className={countBadge}>{totals.count}</span>}
          </Link>
          <Link to={user ? "/account/orders" : "/login"} className={iconBtn} aria-label="Account">
            <User size={20} />
          </Link>
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-[45] bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-[300px] max-w-[85vw] flex-col overflow-y-auto bg-surface p-4 text-ink shadow-menu transition-transform duration-200 ${
          menuOpen ? "visible translate-x-0" : "invisible -translate-x-[105%]"
        }`}
        aria-hidden={!menuOpen}
        aria-label="Menu"
      >
        <div className="mb-2 flex items-center justify-between">
          <Logo dark />
          <button
            type="button"
            className="inline-grid size-[38px] cursor-pointer place-items-center rounded-full text-ink"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="flex flex-col">
          <NavLink to="/" end className={menuLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" end className={menuLinkClass}>
            Shop All
          </NavLink>
          <NavLink to="/deals" className={menuLinkClass}>
            Deals
          </NavLink>
          <NavLink to="/categories" className={menuLinkClass}>
            All Categories
          </NavLink>
        </nav>

        <div className="mt-4 mb-1.5 px-3 text-xs font-semibold tracking-wide text-muted uppercase">Categories</div>
        <nav className="flex flex-col">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to={`/shop?category=${c.slug}`}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 font-medium text-ink hover:bg-primary-soft hover:text-primary-hover [&>svg]:text-primary"
            >
              <CategoryIcon name={c.icon} size={18} />
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="mt-4 mb-1.5 px-3 text-xs font-semibold tracking-wide text-muted uppercase">Account</div>
        <nav className="flex flex-col">
          {user ? (
            <>
              <NavLink to="/account/orders" className={menuLinkClass}>
                My Orders
              </NavLink>
              <NavLink to="/account/profile" className={menuLinkClass}>
                Profile
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className={menuLinkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={menuLinkClass}>
                Create Account
              </NavLink>
            </>
          )}
          <NavLink to="/account/wishlist" className={menuLinkClass}>
            Wishlist ({wishlist.length})
          </NavLink>
          <NavLink to="/cart" className={menuLinkClass}>
            Cart ({totals.count})
          </NavLink>
        </nav>
      </aside>
    </header>
  );
};

export default Header;
