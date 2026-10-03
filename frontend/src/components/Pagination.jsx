const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;

  const goTo = (nextPage) => {
    onChange(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const arrow = "btn btn-outline btn-sm size-8 p-0 text-lg leading-none";

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
      <span className="text-muted">{total} total</span>
      <div className="flex items-center gap-1.5">
        <button
          className={arrow}
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          aria-label="Previous page"
          title="Previous page"
        >
          ‹
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className={arrow}
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          aria-label="Next page"
          title="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
