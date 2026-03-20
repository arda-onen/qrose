import express from "express";
import bcrypt from "bcryptjs";
import path from "path";
import { pool } from "../db/pool.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { createUniqueSlug } from "../utils/slug.js";
import { generateMenuQr } from "../utils/qr.js";
import { getFullMenuByMenuId } from "../utils/menuData.js";
import { generateStaticExport } from "../utils/exporter.js";

const router = express.Router();
const ALLOWED_THEMES = new Set(["cafe", "restaurant", "fast_food"]);
const ALLOWED_COLOR_PALETTES = new Set(["sunset", "emerald", "royal"]);

router.use(requireAuth, requireRole("admin"));

router.post("/menus", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      name,
      restaurant_name: restaurantName,
      theme = "fast_food",
      color_palette: colorPalette = "sunset",
      brand_icon: brandIcon = "",
      hero_image: heroImage = "",
      shop_description: shopDescription = "",
      contact_phone: contactPhone = "",
      contact_email: contactEmail = "",
      address_line: addressLine = "",
      supported_languages: supportedLanguages = ["en"],
      owner_email: ownerEmail,
      owner_password: ownerPassword
    } = req.body;

    if (!name || !restaurantName || !ownerEmail || !ownerPassword) {
      return res.status(400).json({
        message: "name, restaurant_name, owner_email and owner_password are required."
      });
    }
    if (!ALLOWED_THEMES.has(theme)) {
      return res.status(400).json({ message: "Invalid theme." });
    }
    if (!ALLOWED_COLOR_PALETTES.has(colorPalette)) {
      return res.status(400).json({ message: "Invalid color_palette." });
    }

    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash(ownerPassword, 10);
    const userInsert = await client.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'restaurant') RETURNING id, email, role",
      [ownerEmail.toLowerCase(), passwordHash]
    );
    const ownerUser = userInsert.rows[0];
    const slug = await createUniqueSlug(restaurantName);

    const menuInsert = await client.query(
      `INSERT INTO menus (
         name,
         restaurant_name,
         slug,
         theme,
         color_palette,
         brand_icon,
         hero_image,
         shop_description,
         contact_phone,
         contact_email,
         address_line,
         supported_languages,
         owner_user_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, slug`,
      [
        name,
        restaurantName,
        slug,
        theme,
        colorPalette,
        brandIcon,
        heroImage,
        shopDescription,
        contactPhone,
        contactEmail,
        addressLine,
        supportedLanguages,
        ownerUser.id
      ]
    );
    const menu = menuInsert.rows[0];
    const qrPath = await generateMenuQr(menu.id, menu.slug);

    await client.query("COMMIT");

    return res.status(201).json({
      menu_id: menu.id,
      slug: menu.slug,
      owner: ownerUser,
      qr_path: qrPath
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      return res.status(409).json({ message: "Duplicate menu or owner email." });
    }
    return next(error);
  } finally {
    client.release();
  }
});

router.get("/menus", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id,
         m.name,
         m.restaurant_name,
         m.slug,
         m.theme,
         m.color_palette,
         m.brand_icon,
         m.hero_image,
         m.shop_description,
         m.contact_phone,
         m.contact_email,
         m.address_line,
         m.supported_languages,
         m.owner_user_id,
         u.email AS owner_email
       FROM menus m
       JOIN users u ON u.id = m.owner_user_id
       ORDER BY m.id DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

router.delete("/menus/:id", async (req, res, next) => {
  try {
    const menuId = Number(req.params.id);
    const menuResult = await pool.query(
      "SELECT owner_user_id FROM menus WHERE id = $1",
      [menuId]
    );
    const menu = menuResult.rows[0];
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [menu.owner_user_id]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/menus/:id/qr", async (req, res, next) => {
  try {
    const menuId = Number(req.params.id);
    const menuResult = await pool.query("SELECT id, slug FROM menus WHERE id = $1", [menuId]);
    const menu = menuResult.rows[0];
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const qrPath = await generateMenuQr(menu.id, menu.slug);
    return res.download(path.resolve(process.cwd(), qrPath.replace(/^\//, "")));
  } catch (error) {
    return next(error);
  }
});

router.post("/menus/:id/export", async (req, res, next) => {
  try {
    const menuId = Number(req.params.id);
    const menuData = await getFullMenuByMenuId(menuId);
    if (!menuData) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const { zipPath } = await generateStaticExport(menuData);
    return res.download(zipPath);
  } catch (error) {
    return next(error);
  }
});

export default router;
