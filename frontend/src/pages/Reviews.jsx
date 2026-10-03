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
      <div className="page-header">
        <h1>Reviews</h1>
      </div>

      <div className="toolbar">
        <select className="select" value={rating} onChange={resetPage(setRating)}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <select className="select" value={isVerified} onChange={resetPage(setIsVerified)}>
          <option value="">All reviews</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table>
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
                  <div className="muted">{review.user.email}</div>
                </td>
                <td>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</td>
                <td style={{ whiteSpace: "normal", maxWidth: 320 }}>{review.comment || <span className="muted">-</span>}</td>
                <td>
                  <span className={`badge ${review.isVerified ? "badge-success" : ""}`}>
                    {review.isVerified ? "Verified" : "No"}
                  </span>
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <div className="actions">
                    <button className="btn btn-outline btn-sm" disabled={busyId === review.id} onClick={() => toggleVerified(review)}>
                      {review.isVerified ? "Unverify" : "Verify"}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === review.id} onClick={() => remove(review)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="loading">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="empty">No reviews found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />
    </>
  );
};

export default Reviews;
