import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ActionMenu = ({
  items,
  disabled = false,
  trigger = "⋮",
  triggerClassName = "action-trigger",
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
        className={`${triggerClassName} ${position ? "open" : ""}`}
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
          <div ref={menuRef} className="action-menu" role="menu" style={{ ...position, width }}>
            {header && <div className="action-menu-header">{header}</div>}
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`action-menu-item ${item.danger ? "danger" : ""}`}
                onClick={() => {
                  close();
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
