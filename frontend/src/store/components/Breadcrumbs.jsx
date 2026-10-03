import { Fragment } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = ({ items }) => (
  <nav className="flex flex-wrap items-center gap-1.5 py-[18px] text-[13px] text-muted" aria-label="Breadcrumb">
    {items.map((item, i) => (
      <Fragment key={item.label}>
        {i > 0 && <ChevronRight size={12} />}
        {item.to ? (
          <Link to={item.to} className="text-muted hover:text-primary">
            {item.label}
          </Link>
        ) : (
          <span aria-current="page" className="font-medium text-ink">
            {item.label}
          </span>
        )}
      </Fragment>
    ))}
  </nav>
);

export default Breadcrumbs;
