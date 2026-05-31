import { useState } from "react";
import { api } from "../api/api";

function formatReceiptDate(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PAYMENT_METHODS = ["Cash", "GCash"];

function ReceiptModal({ isOpen, onClose, receipt, onPaymentComplete }) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-gray-100">
          <div className="flex justify-center bg-white p-6">
            <ReceiptContent receipt={receipt} />
          </div>

          {receipt.paymentStatus !== "Paid" && receipt.orderId && (
            <PaymentActions
              orderId={receipt.orderId}
              total={receipt.total}
              onPaymentComplete={onPaymentComplete}
            />
          )}

          <div className="flex gap-2 border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Print Receipt
            </button>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <ReceiptContent receipt={receipt} forPrint />
      </div>
    </>
  );
}

function PaymentActions({ orderId, total, onPaymentComplete }) {
  const [payingMethod, setPayingMethod] = useState(null);
  const [error, setError] = useState("");

  const handlePay = async (method) => {
    try {
      setPayingMethod(method);
      setError("");
      const response = await api.post("/api/users/admin/process-payment", {
        order_id: orderId,
        payment_method: method,
        amount: Number(total) || 0,
      });
      const payment = response.data?.data;
      onPaymentComplete?.({
        paymentStatus: "Paid",
        paymentMethod: payment?.payment_method || method,
        referenceNumber: payment?.reference_number,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setPayingMethod(null);
    }
  };

  return (
    <div className="border-t border-slate-100 px-4 pb-4">
      <p className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
        Collect Payment
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method}
            type="button"
            disabled={!!payingMethod}
            onClick={() => handlePay(method)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 disabled:opacity-50"
          >
            {payingMethod === method ? "Processing..." : method}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

function ReceiptContent({ receipt, forPrint = false }) {
  const {
    orderNumber,
    tableNumber,
    items = [],
    subtotal,
    total,
    paymentStatus = "Pending",
    createdAt,
    paymentMethod,
    referenceNumber,
  } = receipt;

  const isPaid = paymentStatus === "Paid";

  return (
    <div
      {...(forPrint ? { id: "receipt-print-area" } : {})}
      className="receipt-print-area w-full max-w-[320px] font-mono text-slate-900"
    >
      <div className="text-center">
        <p className="receipt-label text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
          NPATAP
        </p>
        <h1 className="mt-1 text-lg font-black uppercase tracking-wide">Official Receipt</h1>
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="space-y-1 text-xs">
        {orderNumber && (
          <div className="flex justify-between gap-4">
            <span className="receipt-label text-slate-500">Order #</span>
            <span className="font-bold">{orderNumber}</span>
          </div>
        )}
        {tableNumber && (
          <div className="flex justify-between gap-4">
            <span className="receipt-label text-slate-500">Table</span>
            <span className="font-bold">{tableNumber}</span>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <span className="receipt-label text-slate-500">Date</span>
          <span className="font-bold">{formatReceiptDate(createdAt)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="receipt-label text-slate-500">Payment</span>
          <span className={`font-bold ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
            {paymentStatus}
          </span>
        </div>
        {paymentMethod && (
          <div className="flex justify-between gap-4">
            <span className="receipt-label text-slate-500">Method</span>
            <span className="font-bold">{paymentMethod}</span>
          </div>
        )}
        {referenceNumber && (
          <div className="flex justify-between gap-4">
            <span className="receipt-label text-slate-500">Ref #</span>
            <span className="font-bold break-all text-right">{referenceNumber}</span>
          </div>
        )}
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 font-bold uppercase tracking-wide text-slate-400 receipt-label">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right w-16">Amount</span>
        </div>
        {items.map((item) => (
          <div
            key={item.menu_id ?? `${item.name}-${item.quantity}`}
            className="grid grid-cols-[1fr_auto_auto] gap-2"
          >
            <span className="break-words">{item.name}</span>
            <span className="text-right">{item.quantity}</span>
            <span className="text-right w-16">
              ₱{((Number(item.price) || 0) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="receipt-label text-slate-500">Subtotal</span>
          <span className="font-bold">₱{Number(subtotal ?? total ?? 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-1 text-sm font-black">
          <span>Total Due</span>
          <span>₱{Number(total ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="my-4 border-t border-dashed border-slate-300" />

      <p className="receipt-label text-center text-[11px] text-slate-500">
        {isPaid ? "Payment received. Thank you!" : "Thank you for dining with us!"}
      </p>
    </div>
  );
}

export default ReceiptModal;
