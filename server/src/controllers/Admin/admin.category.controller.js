import { pool } from "../../config/db.js";

export const add_category = async (req, res) => {
  try {
    const { category_name, category_type } = req.body;

    if (!category_name?.trim() || !category_type?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await pool.query(
      "INSERT INTO tbl_category (category_name,category_type) VALUES ($1,$2)",
      [category_name.trim(), category_type.trim()],
    );

    res.json({ message: "Added new category" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const add_menu = async (req, res) => {
  try {
    const { category_id, name, description, price, stock, image } = req.body;

    const queryAddMenu = await pool.query(
      "INSERT INTO tbl_menu_item (category_id, name, description, price,stock,image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [category_id, name, description?.trim() || "", price, stock, image ?? ""],
    );

    res.json({ message: "Added menu successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update_menu = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock, image } = req.body;

    if (!category_id || !name?.trim() || price === undefined || price === null) {
      return res.status(400).json({ message: "Category, name, and price are required" });
    }

    const result = await pool.query(
      `UPDATE tbl_menu_item
       SET category_id = $1, name = $2, description = $3, price = $4, stock = $5, image = $6
       WHERE id = $7
       RETURNING *`,
      [
        category_id,
        name.trim(),
        description?.trim() || "",
        price,
        stock ?? 0,
        image ?? "",
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "Menu item updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_categories = async (req, res) => {
  try {
    const query = await pool.query(
      "SELECT id, category_name, category_type FROM tbl_category ORDER BY category_name",
    );

    res.json(query.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_menu_item = async (req, res) => {
  try {
    const query = await pool.query(
      "SELECT menu.id AS menu_id, menu.category_id, menu.name, menu.description, menu.price, menu.stock, menu.image, menu.status, c.category_name, c.category_type FROM tbl_menu_item menu JOIN tbl_category c ON menu.category_id = c.id ORDER BY menu.id ASC",
    );

    res.json(query.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const get_category_by_type = async (req, res) => {
  try {
    const { category_type } = req.body;

    const getCategoryByType = await pool.query(
      `SELECT menu.name, menu.description, menu.price, menu.image
        FROM tbl_menu_item menu JOIN tbl_category c 
        ON menu.category_id = c.id WHERE c.category_type = $1`,
      [category_type]
    );

    if(getCategoryByType.rows.length === 0){
      return res.status(404).json({message: "No items found for this category."})
    }

    res.json(getCategoryByType.rows)
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};
