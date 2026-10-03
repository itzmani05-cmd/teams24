import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DEFAULT_TRIGGER =
  "grid size-8 cursor-pointer place-items-center rounded-lg border border-transparent text-xl leading-none text-muted hover:border-line hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

const ActionMenu = ({
  items,
  disabled = false,
  trigger = "⋮",
  triggerClassName = DEFAULT_TRIGGER,
  openClassName = "border-line bg-canvas text-ink",
  label = "Actions",
  header = null,
  width = 140,
}) => {
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const close = () => setPosition(null);

  const toggle = () => {
    if (position) return close();
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = items.length * 36 + 10 + (header ? 60 : 0);
    const opensUp = rect.bottom + 4 + menuHeight > window.innerHeight;
    setPosition({
      top: opensUp ? rect.top - 4 - menuHeight : rect.bottom + 4,
      left: Math.max(8, rect.right - width),
    });
  };

  useEffect(() => {
    if (!position) return;

    const onClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${triggerClassName} ${position ? openClassName : ""}`}
        onClick={toggle}
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
      >
        {trigger}
      </button>
      {position &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-20 rounded-lg border border-line bg-surface p-1 shadow-menu"
            style={{ ...position, width }}
          >
            {header && <div className="mb-1 truncate border-b border-line px-3 pt-2 pb-2.5 text-[13px]">{header}</div>}
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left ${
                  item.danger ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-canvas"
                }`}
                onClick={() => {
                  close();
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

export default ActionMenu;
