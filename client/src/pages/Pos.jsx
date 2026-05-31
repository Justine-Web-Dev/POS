import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../api/api";
import ReceiptModal from "../modals/ReceiptModal";
import AddMenuItem from "../modals/AddMenuItem";
import EditMenuItem from "../modals/EditMenuItem";
import AddCategoryModal from "../modals/AddCategoryModal";

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
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [menuItemToEdit, setMenuItemToEdit] = useState(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);


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

  // const serviceCharge = useMemo(() => {
  //   return Number((cartSubtotal * 0.1).toFixed(2));
  // }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return Number((cartSubtotal).toFixed(2));
  }, [cartSubtotal]);

  const getItemStock = (item) => Number(item?.stock) || 0;

  const isOutOfStock = (item) => getItemStock(item) <= 0;

  const getCartQuantityForItem = (menuId) =>
    cartItems.find((cartItem) => cartItem.menu_id === menuId)?.quantity || 0;

  const getAvailableStock = (item) =>
    Math.max(0, getItemStock(item) - getCartQuantityForItem(item.menu_id));

  const handleAddToCart = (item) => {
    if (!selectedTable) {
      setStatusMessage("Please select a table before adding items to cart.");
      return;
    }

    if (isOutOfStock(item)) {
      setStatusMessage(`"${item.name || "Item"}" is out of stock.`);
      return;
    }

    const availableStock = getAvailableStock(item);
    if (availableStock <= 0) {
      setStatusMessage(`No more stock available for "${item.name || "Item"}".`);
      return;
    }

    const quantityToAdd = Math.min(Math.max(1, quantity), availableStock);
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
        .map((cartItem) => {
          if (cartItem.menu_id !== menuId) return cartItem;

          const menuItem = menuItems.find((item) => item.menu_id === menuId);
          const maxStock = getItemStock(menuItem);
          const newQuantity = cartItem.quantity + delta;

          if (delta > 0 && newQuantity > maxStock) {
            setStatusMessage(
              `Only ${maxStock} in stock for "${cartItem.name}".`,
            );
            return cartItem;
          }

          return { ...cartItem, quantity: Math.max(0, newQuantity) };
        })
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
      setOrderLoading(true)
      setStatusMessage('Sending order...')

      // Server now expects a single batch request with an items array
      const response = await api.post('/api/users/admin/add-order', {
        table_id: selectedTable.id,
        items: cartItems.map((item) => ({
          id: item.menu_id,
          quantity: item.quantity,
        })),
        payment_status: 'Pending',
        order_status: 'New',
      })

      const orderSnapshot = [...cartItems];

      setReceiptData({
        orderNumber: response.data?.data?.order_number,
        tableNumber: selectedTable.table_number,
        items: orderSnapshot,
        subtotal: cartSubtotal,
        total: cartTotal,
        paymentStatus: response.data?.data?.payment_status || "Pending",
        createdAt: response.data?.data?.created_at || new Date().toISOString(),
      });
      setIsReceiptOpen(true);
      setStatusMessage("");
      setCartItems([]);
      fetchTables();
      fetchMenuItems();
    } catch (error) {
      console.error('Fire order error:', error)
      const message = error.response?.data?.message || `Error ${error.response?.status ?? 'Unknown'}: Failed to fire order.`
      setStatusMessage(message)
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans p-4 xl:p-6">
      {/* Top Header Section */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Branding Title */}
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
            NPATAP
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-900 tracking-tight lg:text-3xl">
            Menu Engine
          </h1>
        </div>

        {/* Navigation Filters Box */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:flex-nowrap lg:justify-end">
          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddMenuItemOpen(true)}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap"
            >
              + Menu Item
            </button>
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(true)}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap"
            >
              + Category
            </button>
          </div>

          {/* Categories Scrollable Pill Container */}
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full sm:max-w-xs md:max-w-md lg:max-w-[300px] shrink-0">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1 text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === category
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-white/60"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-[200px] shrink-0"
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
              {filteredMenuItems.map((item) => {
                const outOfStock = isOutOfStock(item);
                const availableStock = getAvailableStock(item);

                return (
                <div
                  key={item.menu_id}
                  className={`flex flex-col justify-between overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                    outOfStock
                      ? "border-slate-200 opacity-60"
                      : "border-slate-200 hover:border-blue-500 hover:shadow-md"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || "Menu item"}
                      className="h-36 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        No image
                      </p>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between p-5">
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
                    {outOfStock ? (
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-red-500">
                        Out of stock
                      </p>
                    ) : (
                      <p className="mt-2 text-[10px] font-semibold text-slate-400">
                        {availableStock} left
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-4">
                    <span className="text-sm font-black text-slate-900">
                      ₱{(Number(item.price) || 0).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMenuItemToEdit(item)}
                        disabled={orderLoading}
                        title="Edit menu item"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-blue-500 hover:text-blue-600 active:scale-95 disabled:opacity-40"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        disabled={orderLoading || outOfStock || availableStock <= 0}
                        title={outOfStock ? "Out of stock" : "Add to cart"}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {orderLoading ? "…" : "+"}
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              );
              })}
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
                <option key={table.id} disabled={table.status.toLowerCase() === "occupied"} value={table.id}>
                  {table.table_number} ({table.status})
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
              cartItems.map((cartItem) => {
                const menuItem = menuItems.find((item) => item.menu_id === cartItem.menu_id);
                const atMaxStock = cartItem.quantity >= getItemStock(menuItem);

                return (
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
                        disabled={atMaxStock}
                        className="h-4 w-4 text-[10px] font-bold text-slate-500 hover:bg-slate-100 rounded-full flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                      >+</button>
                    </div>
                    <p className="text-xs font-bold text-blue-600 w-16 text-right">
                      ₱{((Number(cartItem.price) || 0) * cartItem.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
              })
            )}
          </div>

          {/* Checkout Calculations */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="text-slate-800 font-bold">₱{cartSubtotal.toFixed(2)}</span>
            </div>
            {/* <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Service Charge (10%)</span>
              <span className="text-slate-800 font-bold">₱{serviceCharge.toFixed(2)}</span>
            </div> */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Total Due</span>
              <span className="text-blue-600 text-base">₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* <div className="grid grid-cols-3 gap-1.5">
            {["Card", "Cash", "Split"].map((method) => (
              <button
                key={method}
                className="h-8 rounded-xl border border-slate-200 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-50"
              >
                {method}
              </button>
            ))}
          </div> */}

          <button
            onClick={handleFireOrder}
            disabled={orderLoading || !selectedTable || cartItems.length === 0}
            className="h-10 w-full rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
          >
            {orderLoading ? "Firing..." : "Fire Order"}
          </button>

        </aside>
      </div>
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => {
          setIsReceiptOpen(false);
          setReceiptData(null);
        }}
        receipt={receiptData}
      />

      <AddMenuItem
        isOpen={isAddMenuItemOpen}
        onClose={() => setIsAddMenuItemOpen(false)}
        onSuccess={fetchMenuItems}
      />

      <EditMenuItem
        itemToEdit={menuItemToEdit}
        onClose={() => setMenuItemToEdit(null)}
        onSuccess={fetchMenuItems}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSuccess={fetchMenuItems}
      />
    </div>
  );
}

export default Pos;