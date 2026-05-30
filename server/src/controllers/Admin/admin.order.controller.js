import { pool } from "../../config/db.js";

export const add_order = async (req, res) => {
  try {
    const { table_id, items, payment_status, order_status } = req.body;
    const cashierId = req.user?.id;

    if (!cashierId) {
      return res.status(401).json({ message: 'Access denied. Invalid or missing token.' });
    }

    if (!table_id) {
      return res.status(400).json({ message: 'table_id is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'An array of menu items is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Calculate totals dynamically by checking fresh database values
      let consolidated_total = 0;
      const verifiedItems = [];

      for (const item of items) {
        // MATCH FIXED: Accessing database row by item.id natively
        const menuQuery = await client.query(
          'SELECT id, name, price FROM tbl_menu_item WHERE id = $1', 
          [item.id]
        );
        const menuItem = menuQuery.rows[0];

        if (!menuItem) {
          await client.query('ROLLBACK');
          return res.status(404).json({ message: `Menu item with ID ${item.id} not found` });
        }

        const itemQty = Number(item.quantity) || 1;
        const itemSubtotal = Number(menuItem.price) * itemQty;
        consolidated_total += itemSubtotal;

        verifiedItems.push({
          menu_item_id: menuItem.id,
          quantity: itemQty,
          price: menuItem.price,
          subtotal: itemSubtotal
        });
      }

      // 2. Generate unified order code sequence
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const orderQueryText = `
        INSERT INTO tbl_order (table_id, cashier_id, order_number, total_amount, payment_status, order_status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`;

      const orderValues = [
        table_id,
        // Always use the authenticated user as the cashier.
        cashierId,
        orderNumber,
        consolidated_total,
        payment_status || 'Pending',
        order_status || 'New'
      ];

      const newOrderResult = await client.query(orderQueryText, orderValues);
      const newOrder = newOrderResult.rows[0];

      // 3. Batch insert structural line-items onto ticket architecture
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
          'Kitchen',
          'Pending'
        ];
        const orderItemResult = await client.query(orderItemQuery, orderItemValues);
        insertedOrderItems.push(orderItemResult.rows[0]);
      }

      // 4. Update floor plan state
      await client.query('UPDATE tbl_table SET status = $1 WHERE id = $2', ['Occupied', table_id]);
      
      await client.query('COMMIT');

      return res.status(201).json({
        message: 'Unified order ticket fired successfully',
        data: newOrder,
        order_items: insertedOrderItems
      });
    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating batch order:', error);
    return res.status(500).json({ message: 'Failed to create structured order ticket', error: error.message });
  }
};

export const get_orders = async (req, res) => {
  try {
    const query = await pool.query('SELECT * FROM tbl_order_item ORDER BY id DESC')
    return res.json(query.rows)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get orders', error: error.message })
  }
}