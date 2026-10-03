const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;

  const goTo = (nextPage) => {
    onChange(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pagination">
      <span className="muted">{total} total</span>
      <div className="actions">
        <button
          className="btn btn-outline btn-sm page-btn"
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
          className="btn btn-outline btn-sm page-btn"
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
