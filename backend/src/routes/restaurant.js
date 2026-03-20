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
      supported_languages: supportedLanguages,
      brand_icon: brandIcon,
      hero_image: heroImage,
      shop_description: shopDescription,
      contact_phone: contactPhone,
      contact_email: contactEmail,
      address_line: addressLine
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
             color_palette = COALESCE($5, color_palette),
             brand_icon = COALESCE($6, brand_icon),
             hero_image = COALESCE($7, hero_image),
             shop_description = COALESCE($8, shop_description),
             contact_phone = COALESCE($9, contact_phone),
             contact_email = COALESCE($10, contact_email),
             address_line = COALESCE($11, address_line)
       WHERE id = $12
       RETURNING *`,
      [
        name,
        restaurantName,
        theme,
        supportedLanguages,
        colorPalette,
        brandIcon,
        heroImage,
        shopDescription,
        contactPhone,
        contactEmail,
        addressLine,
        menu.id
      ]
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

router.post("/menu/hero-image", upload.single("image"), async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this user." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Hero image file is required." });
    }
    const heroImagePath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      "UPDATE menus SET hero_image = $1 WHERE id = $2 RETURNING hero_image",
      [heroImagePath, menu.id]
    );
    return res.json({ hero_image: result.rows[0].hero_image });
  } catch (error) {
    return next(error);
  }
});

router.post("/menu/brand-icon", upload.single("image"), async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this user." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Brand icon file is required." });
    }
    const brandIconPath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      "UPDATE menus SET brand_icon = $1 WHERE id = $2 RETURNING brand_icon",
      [brandIconPath, menu.id]
    );
    return res.json({ brand_icon: result.rows[0].brand_icon });
  } catch (error) {
    return next(error);
  }
});

router.post("/categories", upload.single("image"), async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const {
      name,
      short_description: shortDescription = "",
      image = "",
      sort_order: sortOrder = 0
    } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const imagePath = req.file ? `/uploads/${req.file.filename}` : image;
    const result = await pool.query(
      "INSERT INTO categories (menu_id, name, short_description, image, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [menu.id, name, shortDescription, imagePath, sortOrder]
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
    const { name, short_description: shortDescription, image, sort_order: sortOrder } = req.body;
    const result = await pool.query(
      `UPDATE categories c
         SET name = COALESCE($1, c.name),
             short_description = COALESCE($2, c.short_description),
             image = COALESCE($3, c.image),
             sort_order = COALESCE($4, c.sort_order)
       WHERE c.id = $5 AND c.menu_id = $6
       RETURNING c.*`,
      [name, shortDescription, image, sortOrder, categoryId, menu.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post("/categories/:id/image", upload.single("image"), async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    const categoryId = Number(req.params.id);
    if (!req.file) {
      return res.status(400).json({ message: "Category image file is required." });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      `UPDATE categories c
         SET image = $1
       WHERE c.id = $2 AND c.menu_id = $3
       RETURNING c.*`,
      [imagePath, categoryId, menu.id]
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
