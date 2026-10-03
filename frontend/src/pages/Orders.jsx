import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime, formatMoney } from "../utils/format";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const OrderDetail = ({ orderId, onClose, onChanged }) => {
  const { data: order, error, loading, reload } = useFetch(`/admin/orders/${orderId}`);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    setActionError("");
    try {
      await fn();
      await reload();
      onChanged();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (orderStatus) => {
    if (!confirm(`Change order status to "${orderStatus}"?`)) return;
    run(() => api.patch(`/admin/orders/${orderId}/status`, { orderStatus }));
  };

  const changePayment = (paymentStatus) =>
    run(() => api.patch(`/admin/orders/${orderId}/payment-status`, { paymentStatus }));

  return (
    <Modal title={order ? `Order ${order.orderNumber}` : "Order"} onClose={onClose}>
      {loading && !order && <div className="p-10 text-center text-muted">Loading...</div>}
      {error && <div className="alert-error">{error}</div>}
      {actionError && <div className="alert-error">{actionError}</div>}

      {order && (
        <>
          <dl className="mb-4 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 sm:grid-cols-[140px_1fr] [&_dd]:m-0 [&_dt]:text-muted">
            <dt>Placed</dt>
            <dd>{formatDateTime(order.createdAt)}</dd>
            <dt>Customer</dt>
            <dd>
              {order.user.name}
              <div className="text-muted">{order.user.email}</div>
            </dd>
            <dt>Ship to</dt>
            <dd>
              {order.address.fullName}, {order.address.phone}
              <div className="text-muted">
                {[
                  order.address.addressLine1,
                  order.address.addressLine2,
                  order.address.city,
                  order.address.state,
                  order.address.postalCode,
                  order.address.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </dd>
            <dt>Payment method</dt>
            <dd>{order.paymentMethod?.toUpperCase() || "-"}</dd>
            <dt>Order status</dt>
            <dd>
              <StatusBadge status={order.orderStatus} />
            </dd>
            <dt>Payment status</dt>
            <dd>
              <select
                className="input"
                style={{ width: "auto" }}
                value={order.paymentStatus}
                disabled={busy}
                onChange={(e) => changePayment(e.target.value)}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </dd>
          </dl>

          <div className="overflow-x-auto rounded-lg bg-surface shadow-card" style={{ marginBottom: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td>{formatMoney(item.productPrice)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mb-4 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 sm:grid-cols-[140px_1fr] [&_dd]:m-0 [&_dt]:text-muted">
            <dt>Subtotal</dt>
            <dd>{formatMoney(order.subtotal)}</dd>
            <dt>Discount</dt>
            <dd>- {formatMoney(order.discountAmount)}</dd>
            <dt>Shipping</dt>
            <dd>{formatMoney(order.shippingAmount)}</dd>
            <dt>
              <strong>Total</strong>
            </dt>
            <dd>
              <strong>{formatMoney(order.totalAmount)}</strong>
            </dd>
          </dl>

          {NEXT_STATUSES[order.orderStatus].length > 0 && (
            <div className="mt-2 flex justify-end gap-2">
              {NEXT_STATUSES[order.orderStatus].map((status) => (
                <button
                  key={status}
                  className={`btn ${["cancelled", "returned"].includes(status) ? "btn-danger" : "btn-primary"}`}
                  disabled={busy}
                  onClick={() => changeStatus(status)}
                >
                  Mark {status}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

const Orders = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selected, setSelected] = useState(null);

  const { data, error, loading, reload } = useFetch("/admin/orders", { page, search, status, paymentStatus });

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-xl [&>h1]:font-bold sm:[&>h1]:text-[22px]">
        <h1>Orders</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 [&>*]:w-full [&>*]:min-w-0 sm:[&>*]:w-auto sm:[&>*]:min-w-[180px]">
        <input
          className="input"
          placeholder="Order no, customer name or email..."
          value={search}
          onChange={resetPage(setSearch)}
        />
        <select className="input" value={status} onChange={resetPage(setStatus)}>
          <option value="">All order statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="input" value={paymentStatus} onChange={resetPage(setPaymentStatus)}>
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="overflow-x-auto rounded-lg bg-surface shadow-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((order) => (
              <tr key={order.id}>
                <td>
                  <div>{order.orderNumber}</div>
                  <div className="text-muted">{formatDateTime(order.createdAt)}</div>
                </td>
                <td>
                  <div>{order.user.name}</div>
                  <div className="text-muted">{order.user.email}</div>
                </td>
                <td>{order._count.items}</td>
                <td>{formatMoney(order.totalAmount)}</td>
                <td>
                  <StatusBadge status={order.paymentStatus} />
                </td>
                <td>
                  <StatusBadge status={order.orderStatus} />
                </td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelected(order.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-10 text-center text-muted">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="p-6 text-center text-muted">No orders found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />

      {selected && <OrderDetail orderId={selected} onClose={() => setSelected(null)} onChanged={reload} />}
    </>
  );
};

export default Orders;
