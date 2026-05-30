import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

const POLL_INTERVAL_MS = 10000;

const statusStyles = {
  Pending: {
    badge: "bg-white text-slate-500 border-slate-200",
    dot: "bg-slate-300",
  },
  Preparing: {
    badge: "bg-white text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  Ready: {
    badge: "bg-white text-slate-700 border-slate-300",
    dot: "bg-slate-500",
  },
};

const formatElapsed = (createdAt) => {
  if (!createdAt) return "—";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} mins ago`;
};

const getNextAction = (status) => {
  if (status === "Pending") return { label: "Start", next: "Preparing" };
  if (status === "Preparing") return { label: "Mark Ready", next: "Ready" };
  if (status === "Ready") return { label: "Complete", next: "Completed" };
  return null;
};

function StationBoard({
  station,
  displayLabel,
  title,
  subtitle,
  emptyEmoji,
  emptyTitle,
  preparingLabel = "preparing",
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      setError("");
      const response = await api.get("/api/users/admin/get-orders/", {
        params: { station },
      });
      setOrders(response.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || `Failed to load ${title.toLowerCase()} orders`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [station, title]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const groupedTickets = useMemo(() => {
    const map = new Map();

    for (const item of orders) {
      if (!map.has(item.order_id)) {
        map.set(item.order_id, {
          order_id: item.order_id,
          order_number: item.order_number,
          table_number: item.table_number,
          order_created_at: item.order_created_at,
          items: [],
        });
      }
      map.get(item.order_id).items.push(item);
    }

    return Array.from(map.values());
  }, [orders]);

  const stats = useMemo(() => {
    return orders.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.item_status === "Pending") acc.pending += 1;
        if (item.item_status === "Preparing") acc.preparing += 1;
        if (item.item_status === "Ready") acc.ready += 1;
        return acc;
      },
      { total: 0, pending: 0, preparing: 0, ready: 0 },
    );
  }, [orders]);

  const handleUpdateStatus = async (orderItemId, nextStatus) => {
    try {
      setUpdatingId(orderItemId);
      await api.put(`/api/users/admin/update-order-item/${orderItemId}`, {
        item_status: nextStatus,
      });
      await fetchOrders(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update item status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteTicket = async (ticket) => {
    const readyItems = ticket.items.filter((item) => item.item_status === "Ready");
    if (readyItems.length === 0) return;

    try {
      setUpdatingId(`ticket-${ticket.order_id}`);
      await Promise.all(
        readyItems.map((item) =>
          api.put(`/api/users/admin/update-order-item/${item.order_item_id}`, {
            item_status: "Completed",
          }),
        ),
      );
      await fetchOrders(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete ticket");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="w-full bg-white text-slate-700 font-sans p-12 rounded-[24px] border border-slate-100">
      <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {displayLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800 tracking-tight lg:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50/80 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-300" />
            {stats.pending} pending
            <span className="text-slate-200">|</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-400" />
            {stats.preparing} {preparingLabel}
            <span className="text-slate-200">|</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
            {stats.ready} ready
          </div>

          <button
            type="button"
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {lastUpdated && (
        <p className="mt-4 text-[11px] text-slate-400">
          Last updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 10s
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-12 text-center text-slate-400">
          Loading tickets...
        </div>
      ) : groupedTickets.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-12 text-center">
          <span className="text-4xl opacity-80">{emptyEmoji}</span>
          <p className="mt-3 text-sm font-medium text-slate-600">{emptyTitle}</p>
          <p className="mt-1 text-xs text-slate-400">
            New orders from POS will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {groupedTickets.map((ticket) => {
            const hasReadyItems = ticket.items.some((item) => item.item_status === "Ready");
            const ticketBusy = updatingId === `ticket-${ticket.order_id}`;

            return (
              <article
                key={ticket.order_id}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
              >
                <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                         {ticket.table_number}
                      </p>
                      <h2 className="text-sm font-semibold text-slate-800">{ticket.order_number}</h2>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-500">
                      {formatElapsed(ticket.order_created_at)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  {ticket.items.map((item) => {
                    const styles = statusStyles[item.item_status] || statusStyles.Pending;
                    const action = getNextAction(item.item_status);
                    const isUpdating = updatingId === item.order_item_id;

                    return (
                      <div
                        key={item.order_item_id}
                        className="rounded-2xl border border-slate-100 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">
                              {item.quantity}x {item.menu_item_name}
                            </p>
                            {item.menu_item_description && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                                {item.menu_item_description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles.badge}`}
                          >
                            {item.item_status}
                          </span>
                        </div>

                        {action && (
                          <button
                            type="button"
                            disabled={isUpdating || ticketBusy}
                            onClick={() => handleUpdateStatus(item.order_item_id, action.next)}
                            className="mt-3 h-8 w-full rounded-xl bg-blue-500 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                          >
                            {isUpdating ? "Updating..." : action.label}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {hasReadyItems && (
                  <div className="border-t border-slate-100 p-4">
                    <button
                      type="button"
                      disabled={ticketBusy}
                      onClick={() => handleCompleteTicket(ticket)}
                      className="h-9 w-full rounded-xl border border-green-500 text-xs font-semibold text-green-800 transition hover:bg-green-700 hover:text-white disabled:opacity-40"
                    >
                      {ticketBusy ? "Completing..." : "Complete Ready Items"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StationBoard;
