import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/format";

const Reviews = () => {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState("");
  const [isVerified, setIsVerified] = useState("");
  const [busyId, setBusyId] = useState(null);

  const { data, error, loading, reload } = useFetch("/admin/reviews", { page, rating, isVerified });

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const run = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleVerified = (review) =>
    run(review.id, () => api.patch(`/admin/reviews/${review.id}/verify`, { isVerified: !review.isVerified }));

  const remove = (review) => {
    if (!confirm("Delete this review?")) return;
    run(review.id, () => api.delete(`/admin/reviews/${review.id}`));
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-xl [&>h1]:font-bold sm:[&>h1]:text-[22px]">
        <h1>Reviews</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 [&>*]:w-full [&>*]:min-w-0 sm:[&>*]:w-auto sm:[&>*]:min-w-[180px]">
        <select className="input" value={rating} onChange={resetPage(setRating)}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <select className="input" value={isVerified} onChange={resetPage(setIsVerified)}>
          <option value="">All reviews</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="overflow-x-auto rounded-lg bg-surface shadow-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Verified</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((review) => (
              <tr key={review.id}>
                <td>{review.product.name}</td>
                <td>
                  <div>{review.user.name}</div>
                  <div className="text-muted">{review.user.email}</div>
                </td>
                <td>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </td>
                <td style={{ whiteSpace: "normal", maxWidth: 320 }}>
                  {review.comment || <span className="text-muted">-</span>}
                </td>
                <td>
                  <span className={`badge ${review.isVerified ? "badge-success" : ""}`}>
                    {review.isVerified ? "Verified" : "No"}
                  </span>
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <div className="flex gap-1.5">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busyId === review.id}
                      onClick={() => toggleVerified(review)}
                    >
                      {review.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={busyId === review.id}
                      onClick={() => remove(review)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-10 text-center text-muted">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="p-6 text-center text-muted">No reviews found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />
    </>
  );
};

export default Reviews;
