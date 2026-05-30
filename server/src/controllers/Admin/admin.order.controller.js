import { pool } from "../../config/db.js";

const resolveStation = (categoryType) => {
  const type = (categoryType || "").toLowerCase();
  if (
    type.includes("beer") ||
    type.includes("drink") ||
    type.includes("beverage") ||
    type.includes("bar")
  ) {
    return "Beer";
  }
  return "Kitchen";
};

export const add_order = async (req, res) => {
  try {
    const { table_id, items, payment_status, order_status } = req.body;
    const cashierId = req.user?.id;

    if (!cashierId) {
      return res.status(401).json({ message: "Access denied. Invalid or missing token." });
    }

    if (!table_id) {
      return res.status(400).json({ message: "table_id is required" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "An array of menu items is required" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let consolidated_total = 0;
      const verifiedItems = [];

      for (const item of items) {
        const menuQuery = await client.query(
          `SELECT m.id, m.name, m.price, c.category_type
           FROM tbl_menu_item m
           JOIN tbl_category c ON m.category_id = c.id
           WHERE m.id = $1`,
          [item.id],
        );
        const menuItem = menuQuery.rows[0];

        if (!menuItem) {
          await client.query("ROLLBACK");
          return res.status(404).json({ message: `Menu item with ID ${item.id} not found` });
        }

        const itemQty = Number(item.quantity) || 1;
        const itemSubtotal = Number(menuItem.price) * itemQty;
        consolidated_total += itemSubtotal;

        verifiedItems.push({
          menu_item_id: menuItem.id,
          quantity: itemQty,
          price: menuItem.price,
          subtotal: itemSubtotal,
          station: resolveStation(menuItem.category_type),
        });
      }

      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const orderQueryText = `
        INSERT INTO tbl_order (table_id, cashier_id, order_number, total_amount, payment_status, order_status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;

      const orderValues = [
        table_id,
        cashierId,
        orderNumber,
        consolidated_total,
        payment_status || "Pending",
        order_status || "New",
      ];

      const newOrderResult = await client.query(orderQueryText, orderValues);
      const newOrder = newOrderResult.rows[0];

      const insertedOrderItems = [];
      const orderItemQuery = `
        INSERT INTO tbl_order_item (order_id, menu_item_id, quantity, price, subtotal, station, item_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

      for (const verified of verifiedItems) {
        const orderItemValues = [
          newOrder.id,
          verified.menu_item_id,
          verified.quantity,
          verified.price,
          verified.subtotal,
          verified.station,
          "Pending",
        ];
        const orderItemResult = await client.query(orderItemQuery, orderItemValues);
        insertedOrderItems.push(orderItemResult.rows[0]);
      }

      await client.query("UPDATE tbl_table SET status = $1 WHERE id = $2", ["Occupied", table_id]);

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Unified order ticket fired successfully",
        data: newOrder,
        order_items: insertedOrderItems,
      });
    } catch (innerError) {
      await client.query("ROLLBACK");
      throw innerError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating batch order:", error);
    return res.status(500).json({ message: "Failed to create structured order ticket", error: error.message });
  }
};

export const get_orders = async (req, res) => {
  try {
    const { station } = req.query;

    const queryText = `
      SELECT
        oi.id AS order_item_id,
        oi.order_id,
        oi.quantity,
        oi.price,
        oi.subtotal,
        oi.station,
        oi.item_status,
        o.order_number,
        o.created_at AS order_created_at,
        o.order_status,
        t.table_number,
        m.name AS menu_item_name,
        m.description AS menu_item_description
      FROM tbl_order_item oi
      JOIN tbl_order o ON oi.order_id = o.id
      JOIN tbl_table t ON o.table_id = t.id
      JOIN tbl_menu_item m ON oi.menu_item_id = m.id
      WHERE ($1::text IS NULL OR oi.station = $1)
        AND oi.item_status NOT IN ('Completed', 'Cancelled')
      ORDER BY o.created_at ASC, oi.id ASC`;

    const query = await pool.query(queryText, [station || null]);
    return res.json(query.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to get orders", error: error.message });
  }
};

export const update_order_item_status = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_status } = req.body;
    const allowedStatuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];

    if (!item_status || !allowedStatuses.includes(item_status)) {
      return res.status(400).json({ message: "Valid item_status is required" });
    }

    const result = await pool.query(
      "UPDATE tbl_order_item SET item_status = $1 WHERE id = $2 RETURNING *",
      [item_status, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order item not found" });
    }

    return res.json({
      message: "Order item status updated",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order item status", error: error.message });
  }
};
