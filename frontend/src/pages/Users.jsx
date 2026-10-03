import { useState } from "react";
import { api } from "../api/client";
import useFetch from "../hooks/useFetch";
import { useAuth } from "../context/AuthContext";
import ActionMenu from "../components/ActionMenu";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { formatDate } from "../utils/format";

const Users = () => {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [busyId, setBusyId] = useState(null);

  const { data, error, loading, reload } = useFetch("/admin/users", { page, search, role, isActive });

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const updateUser = async (user, changes, message) => {
    if (!confirm(message)) return;
    setBusyId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}`, changes);
      reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Users</h1>
      </div>

      <div className="toolbar">
        <input className="input" placeholder="Name, email or phone..." value={search} onChange={resetPage(setSearch)} />
        <select className="select" value={role} onChange={resetPage(setRole)}>
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>
        <select className="select" value={isActive} onChange={resetPage(setIsActive)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Joined</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((user) => {
              const isSelf = user.id === currentUser.id;
              const busy = busyId === user.id;
              return (
                <tr key={user.id}>
                  <td>
                    <div>{user.name}</div>
                    <div className="muted">{user.email}</div>
                  </td>
                  <td>{user.phone || "-"}</td>
                  <td>
                    <StatusBadge status={user.role} />
                  </td>
                  <td>{user._count.orders}</td>
                  <td>
                    <StatusBadge status={user.isActive ? "active" : "inactive"} />
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="col-actions">
                    {isSelf ? (
                      <span className="muted">You</span>
                    ) : (
                      <ActionMenu
                        disabled={busy}
                        items={[
                          {
                            label: user.role === "admin" ? "Make customer" : "Make admin",
                            onClick: () => {
                              const nextRole = user.role === "admin" ? "customer" : "admin";
                              updateUser(user, { role: nextRole }, `Change ${user.name}'s role to ${nextRole}?`);
                            },
                          },
                          {
                            label: user.isActive ? "Deactivate" : "Activate",
                            danger: user.isActive,
                            onClick: () =>
                              updateUser(
                                user,
                                { isActive: !user.isActive },
                                `${user.isActive ? "Deactivate" : "Activate"} ${user.name}?`
                              ),
                          },
                        ]}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <div className="loading">Loading...</div>}
        {!loading && data?.items.length === 0 && <div className="empty">No users found</div>}
      </div>

      <Pagination pagination={data?.pagination} onChange={setPage} />
    </>
  );
};

export default Users;
