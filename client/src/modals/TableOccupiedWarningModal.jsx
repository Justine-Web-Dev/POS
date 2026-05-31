function TableOccupiedWarningModal({ isOpen, onClose, tableNumber, status = "Occupied" }) {
  if (!isOpen) return null;

  const statusLabel = status || "Occupied";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="alertdialog"
        aria-labelledby="table-warning-title"
        aria-describedby="table-warning-desc"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 id="table-warning-title" className="text-xl font-bold text-slate-900">
          Table unavailable
        </h2>
        <p id="table-warning-desc" className="mt-2 text-sm text-slate-500">
          {tableNumber ? (
            <>
              <span className="font-semibold text-slate-700">{tableNumber}</span> is currently{" "}
              <span className="font-semibold text-orange-600">{statusLabel.toLowerCase()}</span> and
              cannot be used for a new order.
            </>
          ) : (
            <>This table is currently {statusLabel.toLowerCase()} and cannot be used for a new order.</>
          )}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Choose an available table, or update the table status from Table Management if guests have
          left.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default TableOccupiedWarningModal;
