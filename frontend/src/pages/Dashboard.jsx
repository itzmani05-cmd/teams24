import { useState } from "react";
import useFetch from "../hooks/useFetch";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime, formatMoney } from "../utils/format";

const PERIODS = [7, 30, 90, 365];

const Dashboard = () => {
  const [days, setDays] = useState(30);
  const { data, error, loading } = useFetch("/admin/dashboard", { days });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 [&>h1]:text-xl [&>h1]:font-bold sm:[&>h1]:text-[22px]">
        <h1>Dashboard</h1>
        <select
          className="input"
          style={{ width: "auto" }}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              Last {p} days
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {loading && !data && <div className="p-10 text-center text-muted">Loading...</div>}

      {data && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <div className="text-[13px] text-muted">Revenue</div>
              <div className="mt-1.5 text-xl font-bold sm:text-2xl">{formatMoney(data.revenue.inPeriod)}</div>
              <div className="mt-1 text-xs text-muted">{formatMoney(data.revenue.total)} all time</div>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <div className="text-[13px] text-muted">Orders</div>
              <div className="mt-1.5 text-xl font-bold sm:text-2xl">{data.orders.inPeriod}</div>
              <div className="mt-1 text-xs text-muted">{data.orders.total} all time</div>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <div className="text-[13px] text-muted">Customers</div>
              <div className="mt-1.5 text-xl font-bold sm:text-2xl">{data.users.total}</div>
              <div className="mt-1 text-xs text-muted">{data.users.newInPeriod} new in period</div>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <div className="text-[13px] text-muted">Products</div>
              <div className="mt-1.5 text-xl font-bold sm:text-2xl">{data.products.active}</div>
              <div className="mt-1 text-xs text-muted">{data.products.total} total</div>
            </div>
          </div>

          <div className="mb-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <h3 className="mb-3 text-[15px] font-semibold">Orders by status</h3>
              {Object.keys(data.orders.byStatus).length === 0 ? (
                <div className="p-6 text-center text-muted">No orders yet</div>
              ) : (
                <table className="data-table data-table-plain">
                  <tbody>
                    {Object.entries(data.orders.byStatus).map(([status, count]) => (
                      <tr key={status}>
                        <td>
                          <StatusBadge status={status} />
                        </td>
                        <td>{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <h3 className="mb-3 text-[15px] font-semibold">Top selling</h3>
              {data.topSelling.length === 0 ? (
                <div className="p-6 text-center text-muted">No sales in this period</div>
              ) : (
                <table className="data-table data-table-plain">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSelling.map((item) => (
                      <tr key={item.productId}>
                        <td>{item.productName}</td>
                        <td>{item.quantitySold}</td>
                        <td>{formatMoney(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="mb-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <h3 className="mb-3 text-[15px] font-semibold">Recent orders</h3>
              {data.orders.recent.length === 0 ? (
                <div className="p-6 text-center text-muted">No orders yet</div>
              ) : (
                <table className="data-table data-table-plain">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.recent.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div>{order.orderNumber}</div>
                          <div className="text-muted">{formatDateTime(order.createdAt)}</div>
                        </td>
                        <td>{order.user?.name}</td>
                        <td>{formatMoney(order.totalAmount)}</td>
                        <td>
                          <StatusBadge status={order.orderStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="min-w-0 overflow-x-auto rounded-lg bg-surface p-4 shadow-card">
              <h3 className="mb-3 text-[15px] font-semibold">Low stock</h3>
              {data.products.lowStock.length === 0 ? (
                <div className="p-6 text-center text-muted">All products are well stocked</div>
              ) : (
                <table className="data-table data-table-plain">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.lowStock.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <span
                            className="group relative cursor-default border-b border-dashed border-line focus:outline-none"
                            tabIndex={0}
                          >
                            {p.name}
                            <span
                              role="tooltip"
                              className="pointer-events-none invisible absolute bottom-[calc(100%+6px)] left-0 z-[15] translate-y-0.5 rounded-md bg-black px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                            >
                              SKU: {p.sku}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.stock === 0 ? "badge-danger" : "badge-warning"}`}>{p.stock}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
