import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/reviews", label: "Reviews" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2.5 ${
    isActive
      ? "bg-charcoal text-primary shadow-[inset_3px_0_0_var(--color-primary)]"
      : "text-smoke hover:bg-charcoal hover:text-white"
  }`;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const path = pathname.replace(/\/+$/, "") || "/";
  const current = links.find((link) => (link.end ? path === link.to : path.startsWith(link.to)));

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed top-0 left-0 z-30 flex h-screen w-[220px] shrink-0 flex-col bg-black px-3 py-5 text-smoke transition-transform md:sticky md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-3 pb-5 text-xl font-extrabold tracking-tight text-white">
          Teams<span className="text-primary">24</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-[25] bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={current?.label ?? "Admin"}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
