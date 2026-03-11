import express from "express";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { pool } from "../db/pool.js";
import { getMenuByOwnerUserId } from "../utils/menuData.js";
import { generateMenuQr } from "../utils/qr.js";

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), "uploads");
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  }
});
const upload = multer({ storage });
const ALLOWED_THEMES = new Set(["cafe", "restaurant", "fast_food"]);
const ALLOWED_COLOR_PALETTES = new Set(["sunset", "emerald", "royal"]);

router.use(requireAuth, requireRole("restaurant"));

async function getOwnedMenu(req) {
  const result = await pool.query(
    "SELECT id, slug FROM menus WHERE owner_user_id = $1 LIMIT 1",
    [req.user.id]
  );
  return result.rows[0] || null;
}

router.get("/menu", async (req, res, next) => {
  try {
    const menu = await getMenuByOwnerUserId(req.user.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this user." });
    }
    return res.json(menu);
  } catch (error) {
    return next(error);
  }
});

router.put("/menu", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this user." });
    }
    const {
      name,
      restaurant_name: restaurantName,
      theme,
      color_palette: colorPalette,
      supported_languages: supportedLanguages
    } = req.body;
    if (theme && !ALLOWED_THEMES.has(theme)) {
      return res.status(400).json({ message: "Invalid theme." });
    }
    if (colorPalette && !ALLOWED_COLOR_PALETTES.has(colorPalette)) {
      return res.status(400).json({ message: "Invalid color_palette." });
    }
    const result = await pool.query(
      `UPDATE menus
         SET name = COALESCE($1, name),
             restaurant_name = COALESCE($2, restaurant_name),
             theme = COALESCE($3, theme),
             supported_languages = COALESCE($4, supported_languages),
             color_palette = COALESCE($5, color_palette)
       WHERE id = $6
       RETURNING *`,
      [name, restaurantName, theme, supportedLanguages, colorPalette, menu.id]
    );
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.get("/menu/qr", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const qrPath = await generateMenuQr(menu.id, menu.slug);
    return res.download(path.resolve(process.cwd(), qrPath.replace(/^\//, "")));
  } catch (error) {
    return next(error);
  }
});

router.post("/categories", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const { name, sort_order: sortOrder = 0 } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const result = await pool.query(
      "INSERT INTO categories (menu_id, name, sort_order) VALUES ($1, $2, $3) RETURNING *",
      [menu.id, name, sortOrder]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.put("/categories/:id", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    const categoryId = Number(req.params.id);
    const { name, sort_order: sortOrder } = req.body;
    const result = await pool.query(
      `UPDATE categories c
         SET name = COALESCE($1, c.name),
             sort_order = COALESCE($2, c.sort_order)
       WHERE c.id = $3 AND c.menu_id = $4
       RETURNING c.*`,
      [name, sortOrder, categoryId, menu.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.delete("/categories/:id", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    const categoryId = Number(req.params.id);
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND menu_id = $2 RETURNING id",
      [categoryId, menu.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post("/items", upload.single("image"), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const menu = await getOwnedMenu(req);
    const {
      category_id: categoryId,
      price = 0,
      sort_order: sortOrder = 0,
      translations = "[]"
    } = req.body;
    const parsedTranslations = Array.isArray(translations)
      ? translations
      : JSON.parse(translations);

    await client.query("BEGIN");
    const categoryCheck = await client.query(
      "SELECT id FROM categories WHERE id = $1 AND menu_id = $2",
      [categoryId, menu.id]
    );
    if (!categoryCheck.rows[0]) {
      return res.status(404).json({ message: "Category not found for this menu." });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const itemInsert = await client.query(
      "INSERT INTO menu_items (category_id, price, image, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [categoryId, price, imagePath, sortOrder]
    );
    const item = itemInsert.rows[0];
    for (const t of parsedTranslations) {
      await client.query(
        "INSERT INTO menu_item_translations (menu_item_id, language_code, item_name, description) VALUES ($1, $2, $3, $4)",
        [item.id, t.language_code, t.item_name, t.description || ""]
      );
    }
    await client.query("COMMIT");
    return res.status(201).json(item);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.put("/items/:id", upload.single("image"), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const menu = await getOwnedMenu(req);
    const itemId = Number(req.params.id);
    const {
      price,
      category_id: categoryId,
      sort_order: sortOrder,
      translations = "[]"
    } = req.body;
    const parsedTranslations = Array.isArray(translations)
      ? translations
      : JSON.parse(translations);

    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE menu_items mi
         SET price = COALESCE($1, mi.price),
             category_id = COALESCE($2, mi.category_id),
             image = COALESCE($3, mi.image),
             sort_order = COALESCE($4, mi.sort_order)
       FROM categories c
       WHERE mi.id = $5
         AND c.id = mi.category_id
         AND c.menu_id = $6
       RETURNING mi.*`,
      [price, categoryId, req.file ? `/uploads/${req.file.filename}` : null, sortOrder, itemId, menu.id]
    );
    if (!result.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Item not found." });
    }

    for (const t of parsedTranslations) {
      await client.query(
        `INSERT INTO menu_item_translations (menu_item_id, language_code, item_name, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (menu_item_id, language_code)
         DO UPDATE SET item_name = EXCLUDED.item_name, description = EXCLUDED.description`,
        [itemId, t.language_code, t.item_name, t.description || ""]
      );
    }

    await client.query("COMMIT");
    return res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.delete("/items/:id", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    const itemId = Number(req.params.id);
    const result = await pool.query(
      `DELETE FROM menu_items mi
       USING categories c
       WHERE mi.id = $1
         AND c.id = mi.category_id
         AND c.menu_id = $2
       RETURNING mi.id`,
      [itemId, menu.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Item not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
