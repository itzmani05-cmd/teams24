import ActionMenu from "./ActionMenu";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "A";

const Navbar = ({ title, user, onMenuClick, onLogout }) => (
  <header className="navbar">
    <div className="navbar-left">
      <button type="button" className="navbar-toggle" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span className="muted">Admin</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{title}</span>
      </nav>
    </div>

    <ActionMenu
      label="Account menu"
      triggerClassName="navbar-user"
      width={220}
      trigger={
        <>
          <span className="avatar">{getInitials(user.name)}</span>
          <span className="navbar-user-info">
            <span className="navbar-user-name">{user.name}</span>
            <span className="navbar-user-role">{user.role}</span>
          </span>
          <span className="navbar-caret">▾</span>
        </>
      }
      header={
        <>
          <div className="navbar-user-name">{user.name}</div>
          <div className="muted">{user.email}</div>
        </>
      }
      items={[{ label: "Logout", onClick: onLogout, danger: true }]}
    />
  </header>
);

export default Navbar;
