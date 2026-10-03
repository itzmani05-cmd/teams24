import { Link } from "react-router";
import { ArrowUp, Clock, Mail, Phone, RotateCcw, ShoppingCart, Truck } from "lucide-react";
import { useCatalog } from "../context/CatalogContext";
import { useShop } from "../context/ShopContext";
import { contact, telHref } from "../data/contact";
import { FacebookIcon, InstagramIcon } from "./BrandIcons";

const footerLink = "w-fit py-1 text-smoke transition-colors hover:text-primary";
const heading = "mb-2 text-xs font-bold tracking-[0.08em] text-white uppercase";
const socialBtn =
  "grid size-10 place-items-center rounded-full border border-charcoal bg-charcoal text-white transition-colors hover:border-primary hover:bg-primary";
const contactRow =
  "flex items-start gap-3 py-1 text-smoke [overflow-wrap:anywhere] [&>svg]:mt-0.5 [&>svg]:shrink-0 [&>svg]:text-primary";

const Footer = () => {
  const { categories } = useCatalog();
  const { user, totals, wishlistItems } = useShop();

  const accountLinks = user
    ? [
        { to: "/account/orders", label: "My Orders" },
        { to: "/account/profile", label: "Profile" },
        { to: "/account/addresses", label: "Addresses" },
      ]
    : [
        { to: "/login", label: "Login" },
        { to: "/register", label: "Create Account" },
      ];

  return (
    <footer className="mt-10 bg-black text-smoke">
      <div className="page-container grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 sm:py-12 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr] lg:gap-10">
        <div className="col-span-2 flex flex-col gap-4 sm:col-span-3 lg:col-span-1">
          <Link to="/" className="inline-flex w-fit items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-primary text-white">
              <ShoppingCart size={17} strokeWidth={2.5} />
            </span>
            <span className="text-[22px] font-extrabold tracking-tight text-white">
              Teams<span className="text-primary">24</span>
            </span>
          </Link>
          <p className="max-w-[320px] leading-relaxed">
            Top brands, great deals and a better shopping experience — delivered to your door.
          </p>
          <div className="flex gap-2.5">
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Teams24 on Instagram"
              className={socialBtn}
            >
              <InstagramIcon />
            </a>
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Teams24 on Facebook"
              className={socialBtn}
            >
              <FacebookIcon />
            </a>
          </div>
        </div>

        <nav className="flex flex-col" aria-label="Shop">
          <h4 className={heading}>Shop</h4>
          {categories.map((c) => (
            <Link key={c.slug} to={`/shop?category=${c.slug}`} className={footerLink}>
              {c.name}
            </Link>
          ))}
          <Link to="/categories" className={footerLink}>
            All Categories
          </Link>
          <Link
            to="/deals"
            className="w-fit py-1 font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Today's Deals
          </Link>
        </nav>

        <nav className="flex flex-col" aria-label="Account">
          <h4 className={heading}>Account</h4>
          {accountLinks.map((l) => (
            <Link key={l.to} to={l.to} className={footerLink}>
              {l.label}
            </Link>
          ))}
          <Link to="/account/wishlist" className={footerLink}>
            Wishlist{wishlistItems.length > 0 && ` (${wishlistItems.length})`}
          </Link>
          <Link to="/cart" className={footerLink}>
            Cart{totals.count > 0 && ` (${totals.count})`}
          </Link>
        </nav>

        <div className="col-span-2 flex flex-col sm:col-span-1">
          <h4 className={heading}>Customer Care</h4>
          <a href={telHref(contact.phone)} className={`${contactRow} hover:text-primary`}>
            <Phone size={16} />
            {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className={`${contactRow} hover:text-primary`}>
            <Mail size={16} />
            {contact.email}
          </a>
          <span className={contactRow}>
            <Clock size={16} />
            {contact.hours}
          </span>
          <div className="mt-4 grid gap-2 rounded-xl border border-charcoal p-3.5 xs:grid-cols-2 sm:grid-cols-1">
            <span className="flex items-center gap-2.5 text-[13px]">
              <Truck size={16} className="shrink-0 text-primary" />
              Free shipping over ₹500
            </span>
            <span className="flex items-center gap-2.5 text-[13px]">
              <RotateCcw size={16} className="shrink-0 text-primary" />
              7-day easy returns
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal">
        <div className="page-container flex flex-col gap-4 py-5 text-xs md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} Teams24. All rights reserved.</span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal">
            <Link to="/terms" className="text-smoke transition-colors hover:text-primary">
              Terms &amp; Conditions
            </Link>
            <Link to="/privacy" className="text-smoke transition-colors hover:text-primary">
              Privacy Policy
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 font-semibold text-white transition-colors hover:text-primary"
          >
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
