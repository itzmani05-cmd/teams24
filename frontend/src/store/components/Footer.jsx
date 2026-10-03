import { Link } from "react-router";
import { Clock, Mail, Phone } from "lucide-react";
import { categories } from "../data/catalog";
import { contact, telHref } from "../data/contact";
import { FacebookIcon, InstagramIcon } from "./BrandIcons";

const footerLink = "py-[3px] text-smoke hover:text-primary";
const contactRow =
  "inline-flex items-center gap-2 py-[3px] [overflow-wrap:anywhere] text-smoke [&>svg]:shrink-0 [&>svg]:text-primary";
const socialBtn =
  "grid size-[38px] place-items-center rounded-full border border-charcoal bg-charcoal text-white transition-colors hover:border-primary hover:bg-primary hover:text-white";
const heading = "mb-3 font-bold text-white";

const Footer = () => (
  <footer className="mt-6 bg-black text-smoke">
    <div className="page-container grid grid-cols-2 gap-x-4 gap-y-5 pt-7 pb-7 sm:grid-cols-[2fr_1fr_1fr_1fr] sm:gap-6 sm:pt-10">
      <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Teams<span className="text-primary">24</span>
        </span>
        <p className="mt-1 max-w-[260px]">Top brands, great deals and a better shopping experience.</p>
        <div className="mt-3.5 flex gap-2.5">
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
      <div className="flex flex-col gap-2">
        <h4 className={heading}>Shop</h4>
        {categories.slice(0, 4).map((c) => (
          <Link key={c.slug} to={`/shop?category=${c.slug}`} className={footerLink}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className={heading}>Account</h4>
        <Link to="/account/orders" className={footerLink}>
          My Orders
        </Link>
        <Link to="/account/wishlist" className={footerLink}>
          Wishlist
        </Link>
        <Link to="/cart" className={footerLink}>
          Cart
        </Link>
      </div>
      <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
        <h4 className={heading}>Customer Care</h4>
        <a href={telHref(contact.phone)} className={`${contactRow} hover:text-primary`}>
          <Phone size={15} /> {contact.phone}
        </a>
        <a href={`mailto:${contact.email}`} className={`${contactRow} hover:text-primary`}>
          <Mail size={15} /> {contact.email}
        </a>
        <span className={contactRow}>
          <Clock size={15} /> {contact.hours}
        </span>
      </div>
    </div>
    <div className="page-container flex flex-wrap justify-between gap-x-4 gap-y-1.5 border-t border-charcoal pt-4 pb-5 text-xs">
      <span>© {new Date().getFullYear()} Teams24. All rights reserved.</span>
      <span>Free shipping over ₹500 · 7-day easy returns</span>
    </div>
  </footer>
);

export default Footer;
