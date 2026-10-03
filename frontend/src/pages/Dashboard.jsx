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
      <div className="page-header">
        <h1>Dashboard</h1>
        <select className="select" style={{ width: "auto" }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              Last {p} days
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && !data && <div className="loading">Loading...</div>}

      {data && (
        <>
          <div className="stats">
            <div className="card">
              <div className="stat-label">Revenue</div>
              <div className="stat-value">{formatMoney(data.revenue.inPeriod)}</div>
              <div className="stat-sub">{formatMoney(data.revenue.total)} all time</div>
            </div>
            <div className="card">
              <div className="stat-label">Orders</div>
              <div className="stat-value">{data.orders.inPeriod}</div>
              <div className="stat-sub">{data.orders.total} all time</div>
            </div>
            <div className="card">
              <div className="stat-label">Customers</div>
              <div className="stat-value">{data.users.total}</div>
              <div className="stat-sub">{data.users.newInPeriod} new in period</div>
            </div>
            <div className="card">
              <div className="stat-label">Products</div>
              <div className="stat-value">{data.products.active}</div>
              <div className="stat-sub">{data.products.total} total</div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Orders by status</h3>
              {Object.keys(data.orders.byStatus).length === 0 ? (
                <div className="empty">No orders yet</div>
              ) : (
                <table>
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

            <div className="card">
              <h3>Top selling</h3>
              {data.topSelling.length === 0 ? (
                <div className="empty">No sales in this period</div>
              ) : (
                <table>
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

          <div className="grid-2">
            <div className="card">
              <h3>Recent orders</h3>
              {data.orders.recent.length === 0 ? (
                <div className="empty">No orders yet</div>
              ) : (
                <table>
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
                          <div className="muted">{formatDateTime(order.createdAt)}</div>
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

            <div className="card">
              <h3>Low stock</h3>
              {data.products.lowStock.length === 0 ? (
                <div className="empty">All products are well stocked</div>
              ) : (
                <table>
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
                          <span className="tooltip" data-tooltip={`SKU: ${p.sku}`} tabIndex={0}>
                            {p.name}
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
