import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { categories, products } from "../data/catalog";
import Breadcrumbs from "../components/Breadcrumbs";
import CategoryIcon from "../components/CategoryIcon";

const Categories = () => (
  <div className="page-container">
    <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Categories" }]} />
    <div className="mb-[18px] flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between [&_h1]:text-[22px] [&_h1]:font-bold [&_h1]:tracking-tight sm:[&_h1]:text-[26px]">
      <div>
        <h1>All Categories</h1>
        <span className="text-muted">{categories.length} categories</span>
      </div>
    </div>
    <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => {
        const preview = products.filter((p) => p.category.slug === c.slug).slice(0, 3);
        return (
          <Link
            key={c.slug}
            to={`/shop?category=${c.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 text-ink"
          >
            <div className="flex items-center gap-3.5 [&_h3]:text-base [&_h3]:font-bold">
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line bg-surface text-black transition group-hover:-translate-y-0.5 group-hover:border-primary group-hover:bg-primary-soft group-hover:text-primary">
                <CategoryIcon name={c.icon} />
              </span>
              <div>
                <h3>{c.name}</h3>
                <span className="text-muted">{c.count} products</span>
              </div>
            </div>
            <p className="text-muted">{c.description}</p>
            <div className="grid grid-cols-3 gap-2 [&>img]:aspect-square [&>img]:w-full [&>img]:rounded-lg [&>img]:bg-subtle [&>img]:object-cover">
              {preview.map((p) => (
                <img key={p.id} src={p.thumbnail} alt="" loading="lazy" />
              ))}
            </div>
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
              Shop {c.name} <ArrowRight size={14} />
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);

export default Categories;
