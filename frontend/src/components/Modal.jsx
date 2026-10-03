const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-10 grid items-end bg-black/50 sm:place-items-center sm:p-4" onClick={onClose}>
    <div
      className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface px-4 py-[18px] sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-lg sm:p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <button
          className="cursor-pointer border-none bg-transparent text-[22px] leading-none text-muted"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
