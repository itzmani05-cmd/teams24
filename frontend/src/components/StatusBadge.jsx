const VARIANTS = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
  paid: "success",
  failed: "danger",
  refunded: "warning",
  active: "success",
  inactive: "danger",
  admin: "primary",
  customer: "info",
};

const StatusBadge = ({ status }) => (
  <span className={VARIANTS[status] ? `badge badge-${VARIANTS[status]}` : "badge"}>{status}</span>
);

export default StatusBadge;
