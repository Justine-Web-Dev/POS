import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../api/api";

function Pos() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderLoading, setOrderLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const normalizedStatus = (status) => {
    if (!status) return "Available";
    const value = status.toString().trim().toLowerCase();
    if (value === "occupied") return "Occupied";
    if (value === "dirty") return "Dirty";
    if (value === "reserved") return "Reserved";
    return "Available";
  };

  const fetchTables = useCallback(async () => {
    try {
      const response = await api.get("/api/users/admin/read-table");
      const normalized = (response.data || []).map((table) => ({
        ...table,
        status: normalizedStatus(table.status),
      }));
      setTables(normalized);
    } catch (error) {
      console.error("Unable to load tables", error);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await api.get("/api/users/admin/get-menu/");
      setMenuItems(response.data || []);
    } catch (error) {
      console.error("Unable to load menu items", error);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    fetchMenuItems();
  }, [fetchTables, fetchMenuItems]);

  const categories = useMemo(() => {
    const values = menuItems.map((item) => item.category_type || "Unknown");
    return ["All", ...Array.from(new Set(values))];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category_type === selectedCategory;
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
  }, [menuItems, selectedCategory, searchQuery]);

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setStatusMessage("");
  };

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  }, [cartItems]);

  const serviceCharge = useMemo(() => {
    return Number((cartSubtotal * 0.1).toFixed(2));
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Number((cartSubtotal + serviceCharge).toFixed(2));
  }, [cartSubtotal, serviceCharge]);

  const handleAddToCart = (item) => {
    if (!selectedTable) {
      setStatusMessage("Please select a table before adding items to cart.");
      return;
    }

    const quantityToAdd = Math.max(1, quantity);
    setCartItems((currentItems) => {
      const existing = currentItems.find(
        (cartItem) => cartItem.menu_id === item.menu_id,
      );
      if (existing) {
        return currentItems.map((cartItem) =>
          cartItem.menu_id === item.menu_id
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem,
        );
      }
      return [
        ...currentItems,
        {
          menu_id: item.menu_id,
          name: item.name || "Unnamed Item",
          price: Number(item.price) || 0,
          quantity: quantityToAdd,
          category: item.category_name || item.category_type || "Menu",
        },
      ];
    });
    setStatusMessage(`${item.name || "Item"} added to cart.`);
    setQuantity(1);
  };

  const handleChangeCartQuantity = (menuId, delta) => {
    setCartItems((currentItems) =>
      currentItems
        .map((cartItem) =>
          cartItem.menu_id === menuId
            ? { ...cartItem, quantity: Math.max(0, cartItem.quantity + delta) }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
  };

  const handleFireOrder = async () => {
    if (!selectedTable) {
      setStatusMessage("Please select a table before firing the order.");
      return;
    }

    if (cartItems.length === 0) {
      setStatusMessage("Your cart is empty. Add menu items first.");
      return;
    }

    try {
      setOrderLoading(true);
      setStatusMessage("Sending order...");
      
      for (const item of cartItems) {
        // Appended trailing slash to match the pattern your backend uses for endpoints
        await api.post("/api/users/admin/add-order/", {
          table_id: selectedTable.id,
          menu_item_id: item.menu_id,
          quantity: item.quantity,
          payment_status: "Pending",
          order_status: "New",
        });
      }
      
      setStatusMessage(
        `Order fired for ${cartItems.length} item${cartItems.length > 1 ? "s" : ""}.`,
      );
      setCartItems([]);
      fetchTables();
    } catch (error) {
      console.error("Fire order network error details:", error);
      const message = error.response?.data?.message || `Error ${error.response?.status || "Unknown"}: Failed to save order.`;
      setStatusMessage(message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans p-4 xl:p-6">
      {/* Top Header Section */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            VelvetTap
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight lg:text-3xl">
            Menu Engine
          </h1>
        </div>
        
        {/* Navigation Filters Box */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-full overflow-x-auto max-w-full">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1 text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-white/60"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-[200px]"
          />
        </div>
      </header>

      <p className="text-xs text-slate-400 mt-4">
        Browse menu items by category or search for the perfect drink.
      </p>

      {/* Main Core Split Workspace Grid */}
      <div className="mt-4 grid gap-6 items-start grid-cols-1 xl:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px]">
        
        {/* LEFT COMPONENT: Catalog Card Matrix */}
        <main className="min-w-0">
          {filteredMenuItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
              No menu items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => (
                <div
                  key={item.menu_id}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 hover:shadow-md min-h-[160px]"
                >
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
                      {item.category_name || item.category_type || "Menu"}
                    </p>
                    {/* Fixed Text clipping here: normal breaks ensure wrapping text fields */}
                    <h2 className="mt-1 text-sm font-black text-slate-900 leading-snug break-words">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400 line-clamp-2">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-4">
                    <span className="text-sm font-black text-slate-900">
                      ₱{(Number(item.price) || 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={orderLoading}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95 disabled:opacity-40"
                    >
                      {orderLoading ? "…" : "+"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* RIGHT COMPONENT: Order Ticket Node Panel */}
        <aside className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              Active Ticket
            </p>
            <h2 className="text-base font-extrabold text-slate-900">
              Table Allocation
            </h2>
            <select
              value={selectedTable?.id || ""}
              onChange={(e) => {
                const table = tables.find((t) => String(t.id) === e.target.value);
                if (table) handleSelectTable(table);
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-blue-500"
            >
              <option value="" disabled>Choose Table...</option>
              {tables.map((table) => (
                <option key={table.id} value={table.id}>
                  Table {table.table_number} ({table.status})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Stream Area */}
          <div className="max-h-[280px] overflow-y-auto space-y-2 pr-0.5">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <span className="text-2xl mb-1">🛒</span>
                <p className="text-xs font-bold text-slate-700">Cart is empty</p>
                <p className="text-[11px] max-w-[180px] mt-0.5">Tap menu items to add them here.</p>
              </div>
            ) : (
              cartItems.map((cartItem) => (
                <div key={cartItem.menu_id} className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">{cartItem.name}</p>
                    <p className="text-[10px] text-slate-400">₱{(Number(cartItem.price) || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-0.5">
                      <button
                        type="button"
                        onClick={() => handleChangeCartQuantity(cartItem.menu_id, -1)}
                        className="h-4 w-4 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-full flex items-center justify-center"
                      >−</button>
                      <span className="text-[10px] font-bold text-slate-800 min-w-[12px] text-center">{cartItem.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleChangeCartQuantity(cartItem.menu_id, 1)}
                        className="h-4 w-4 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-full flex items-center justify-center"
                      >+</button>
                    </div>
                    <p className="text-xs font-bold text-blue-600 w-16 text-right">
                      ₱{((Number(cartItem.price) || 0) * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Calculations */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800 font-bold">₱{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Service Charge (10%)</span>
              <span className="text-slate-800 font-bold">₱{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Due</span>
              <span className="text-blue-600 text-base">₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {["Card", "Cash", "Split"].map((method) => (
              <button
                key={method}
                className="h-8 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50"
              >
                {method}
              </button>
            ))}
          </div>

          <button
            onClick={handleFireOrder}
            disabled={orderLoading || !selectedTable || cartItems.length === 0}
            className="h-10 w-full rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
          >
            {orderLoading ? "Firing..." : "Fire Order"}
          </button>

          {/* Interactive Console Debug Message */}
          {statusMessage && (
            <div className="text-[10px] font-mono bg-slate-900 text-slate-200 rounded-xl p-2.5 break-words">
              <span className="text-blue-400 font-bold">Terminal status:</span> {statusMessage}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Pos;