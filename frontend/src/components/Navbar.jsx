import ActionMenu from "./ActionMenu";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "A";

const Navbar = ({ title, user, onMenuClick, onLogout }) => (
  <header className="sticky top-0 z-[5] flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button
        type="button"
        className="grid size-9 cursor-pointer place-items-center rounded-lg border border-line bg-surface text-lg text-ink md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        ☰
      </button>
      <nav className="flex min-w-0 items-center gap-2 whitespace-nowrap" aria-label="Breadcrumb">
        <span className="text-muted">Admin</span>
        <span className="text-muted">›</span>
        <span className="truncate font-semibold">{title}</span>
      </nav>
    </div>

    <ActionMenu
      label="Account menu"
      triggerClassName="flex cursor-pointer items-center gap-2.5 rounded-full border border-transparent bg-transparent py-1 pr-2.5 pl-1 text-left text-ink hover:border-line hover:bg-canvas max-sm:p-0"
      width={220}
      trigger={
        <>
          <span className="grid size-9 place-items-center rounded-full bg-black text-[13px] font-bold text-primary">
            {getInitials(user.name)}
          </span>
          <span className="flex flex-col leading-tight max-sm:hidden">
            <span className="font-semibold">{user.name}</span>
            <span className="text-xs text-muted capitalize">{user.role}</span>
          </span>
          <span className="text-xs text-muted max-sm:hidden">▾</span>
        </>
      }
      header={
        <>
          <div className="font-semibold">{user.name}</div>
          <div className="text-muted">{user.email}</div>
        </>
      }
      items={[{ label: "Logout", onClick: onLogout, danger: true }]}
    />
  </header>
);

export default Navbar;
