import crypto from "crypto";
import express from "express";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireSSEAuth } from "../middleware/sseAuth.js";
import { pool } from "../db/pool.js";
import { getMenuByOwnerUserId } from "../utils/menuData.js";
import { generateMenuQr, generateTableQr } from "../utils/qr.js";
import { broadcastWaiterCalls, fetchPendingCallsForMenu } from "../utils/waiterCalls.js";
import { waiterCallBus, waiterChannel } from "../utils/waiterCallBus.js";

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

async function getOwnedMenu(req) {
  const result = await pool.query(
    "SELECT id, slug FROM menus WHERE owner_user_id = $1 LIMIT 1",
    [req.user.id]
  );
  return result.rows[0] || null;
}

/** EventSource Authorization gönderemediği için ?token= — diğer rotalardan önce */
router.get(
  "/waiter-calls/events",
  requireSSEAuth,
  requireRole("restaurant"),
  async (req, res, next) => {
    try {
      const menu = await getOwnedMenu(req);
      if (!menu) {
        res.status(404).end();
        return;
      }

      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      if (typeof res.flushHeaders === "function") {
        res.flushHeaders();
      }

      const ch = waiterChannel(menu.id);

      const sendSnapshot = async () => {
        const calls = await fetchPendingCallsForMenu(menu.id);
        res.write(`data: ${JSON.stringify({ type: "snapshot", calls })}\n\n`);
      };

      await sendSnapshot();

      const onUpdate = () => {
        sendSnapshot().catch(() => {});
      };
      waiterCallBus.on(ch, onUpdate);

      const heartbeat = setInterval(() => {
        res.write(`: ping ${Date.now()}\n\n`);
      }, 25000);

      req.on("close", () => {
        clearInterval(heartbeat);
        waiterCallBus.off(ch, onUpdate);
      });
    } catch (error) {
      next(error);
    }
  }
);

router.use(requireAuth, requireRole("restaurant"));

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

router.get("/menu/export", async (req, res, next) => {
  try {
    const menu = await getMenuByOwnerUserId(req.user.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found for this user." });
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="menu-${menu.slug}.json"`);
    return res.send(JSON.stringify(menu, null, 2));
  } catch (error) {
    return next(error);
  }
});

router.get("/menu/analytics", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const menuId = menu.id;

    const today = await pool.query(
      `SELECT COALESCE(view_count, 0)::int AS c FROM menu_daily_views
       WHERE menu_id = $1 AND view_date = CURRENT_DATE`,
      [menuId]
    );
    const week = await pool.query(
      `SELECT COALESCE(SUM(view_count), 0)::int AS c FROM menu_daily_views
       WHERE menu_id = $1 AND view_date >= CURRENT_DATE - INTERVAL '6 days'`,
      [menuId]
    );
    const month = await pool.query(
      `SELECT COALESCE(SUM(view_count), 0)::int AS c FROM menu_daily_views
       WHERE menu_id = $1 AND view_date >= CURRENT_DATE - INTERVAL '29 days'`,
      [menuId]
    );

    const topItems = await pool.query(
      `SELECT mi.id, miv.view_count,
        (SELECT item_name FROM menu_item_translations WHERE menu_item_id = mi.id ORDER BY language_code LIMIT 1) AS item_name
       FROM menu_item_view_totals miv
       INNER JOIN menu_items mi ON mi.id = miv.menu_item_id
       INNER JOIN categories c ON c.id = mi.category_id
       WHERE c.menu_id = $1
       ORDER BY miv.view_count DESC
       LIMIT 8`,
      [menuId]
    );

    return res.json({
      viewsToday: today.rows[0]?.c ?? 0,
      viewsWeek: week.rows[0]?.c ?? 0,
      viewsMonth: month.rows[0]?.c ?? 0,
      topItems: topItems.rows.map((r) => ({
        id: r.id,
        name: r.item_name || `Ürün #${r.id}`,
        viewCount: Number(r.view_count)
      }))
    });
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
  const client = await pool.connect();
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const menuRow = await pool.query("SELECT supported_languages FROM menus WHERE id = $1", [menu.id]);
    const supported = menuRow.rows[0]?.supported_languages || ["en"];

    const { translations: translationsRaw = "[]", sort_order: sortOrder = 0 } = req.body;
    let parsedTranslations;
    try {
      parsedTranslations =
        typeof translationsRaw === "string" ? JSON.parse(translationsRaw) : translationsRaw;
    } catch {
      return res.status(400).json({ message: "Invalid translations JSON." });
    }
    if (!Array.isArray(parsedTranslations) || !parsedTranslations.length) {
      return res.status(400).json({ message: "En az bir dil için kategori adı gerekli." });
    }
    const valid = parsedTranslations.filter((t) => t.name && String(t.name).trim());
    if (!valid.length) {
      return res.status(400).json({ message: "Kategori adı boş olamaz." });
    }
    const primary = valid.find((t) => t.language_code === supported[0]) || valid[0];
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    await client.query("BEGIN");
    const result = await client.query(
      "INSERT INTO categories (menu_id, name, short_description, image, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [menu.id, primary.name, primary.short_description || "", imagePath || null, Number(sortOrder) || 0]
    );
    const cat = result.rows[0];
    for (const t of valid) {
      await client.query(
        `INSERT INTO category_translations (category_id, language_code, name, short_description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (category_id, language_code)
         DO UPDATE SET name = EXCLUDED.name, short_description = EXCLUDED.short_description`,
        [cat.id, t.language_code, t.name, t.short_description || ""]
      );
    }
    await client.query("COMMIT");
    return res.status(201).json(cat);
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

router.put("/categories/:id", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const categoryId = Number(req.params.id);
    const menuRow = await pool.query("SELECT supported_languages FROM menus WHERE id = $1", [menu.id]);
    const supported = menuRow.rows[0]?.supported_languages || ["en"];

    const {
      translations: translationsRaw,
      sort_order: sortOrder,
      name,
      short_description: shortDescription,
      image
    } = req.body;

    let parsedTranslations = null;
    if (translationsRaw !== undefined && translationsRaw !== null) {
      try {
        parsedTranslations = Array.isArray(translationsRaw) ? translationsRaw : JSON.parse(translationsRaw);
      } catch {
        return res.status(400).json({ message: "Invalid translations JSON." });
      }
    }

    if (parsedTranslations?.length) {
      await client.query("BEGIN");
      try {
        const valid = parsedTranslations.filter((t) => t.name && String(t.name).trim());
        if (!valid.length) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Kategori adı boş olamaz." });
        }
        const primary = valid.find((t) => t.language_code === supported[0]) || valid[0];
        const result = await client.query(
          `UPDATE categories c
             SET name = $1,
                 short_description = $2,
                 image = COALESCE($3, c.image),
                 sort_order = COALESCE($4, c.sort_order)
           WHERE c.id = $5 AND c.menu_id = $6
           RETURNING c.*`,
          [
            primary.name,
            primary.short_description || "",
            image ?? null,
            sortOrder !== undefined && sortOrder !== null ? Number(sortOrder) : null,
            categoryId,
            menu.id
          ]
        );
        if (!result.rows[0]) {
          await client.query("ROLLBACK");
          return res.status(404).json({ message: "Category not found." });
        }
        for (const t of valid) {
          await client.query(
            `INSERT INTO category_translations (category_id, language_code, name, short_description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (category_id, language_code)
             DO UPDATE SET name = EXCLUDED.name, short_description = EXCLUDED.short_description`,
            [categoryId, t.language_code, t.name, t.short_description || ""]
          );
        }
        await client.query("COMMIT");
        return res.json(result.rows[0]);
      } catch (branchError) {
        await client.query("ROLLBACK");
        throw branchError;
      }
    }

    const result = await client.query(
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
  } finally {
    client.release();
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
      translations = "[]",
      is_published: isPublishedRaw = "true"
    } = req.body;
    const isPublished =
      isPublishedRaw === true || isPublishedRaw === "true" || isPublishedRaw === "1";
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
      "INSERT INTO menu_items (category_id, price, image, sort_order, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [categoryId, price, imagePath, sortOrder, isPublished]
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

/* Spesifik yollar :id'den ÖNCE olmalı; yoksa "bulk-publish" bir ürün id'si sanılır */
router.put("/items/bulk-move", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const { category_id: categoryId, ids } = req.body;
    const itemIds = Array.isArray(ids) ? ids.map(Number).filter((n) => Number.isFinite(n) && n > 0) : [];
    if (!itemIds.length || !categoryId) {
      return res.status(400).json({ message: "Kategori ve ürünler gerekli." });
    }
    const catCheck = await pool.query("SELECT id FROM categories WHERE id = $1 AND menu_id = $2", [
      Number(categoryId),
      menu.id
    ]);
    if (!catCheck.rows[0]) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    await pool.query(
      `UPDATE menu_items mi
         SET category_id = $1, updated_at = NOW()
       FROM categories c
       WHERE mi.id = ANY($2::int[])
         AND c.id = mi.category_id
         AND c.menu_id = $3`,
      [Number(categoryId), itemIds, menu.id]
    );
    return res.json({ ok: true, moved: itemIds.length });
  } catch (error) {
    return next(error);
  }
});

router.put("/items/bulk-publish", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const { ids, is_published: isPublishedRaw } = req.body;
    const itemIds = Array.isArray(ids) ? ids.map(Number).filter((n) => Number.isFinite(n) && n > 0) : [];
    if (!itemIds.length || isPublishedRaw === undefined) {
      return res.status(400).json({ message: "Ürünler ve yayın durumu gerekli." });
    }
    const pub = isPublishedRaw === true || isPublishedRaw === "true";
    await pool.query(
      `UPDATE menu_items mi
         SET is_published = $1, updated_at = NOW()
       FROM categories c
       WHERE mi.id = ANY($2::int[])
         AND c.id = mi.category_id
         AND c.menu_id = $3`,
      [pub, itemIds, menu.id]
    );
    return res.json({ ok: true, updated: itemIds.length });
  } catch (error) {
    return next(error);
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
      translations = "[]",
      is_published: isPublishedRaw
    } = req.body;
    let isPublished = null;
    if (isPublishedRaw !== undefined && isPublishedRaw !== null && isPublishedRaw !== "") {
      isPublished = isPublishedRaw === true || isPublishedRaw === "true" || isPublishedRaw === "1";
    }
    const parsedTranslations = Array.isArray(translations)
      ? translations
      : JSON.parse(translations);

    await client.query("BEGIN");
    const result = await client.query(
      `UPDATE menu_items mi
         SET price = COALESCE($1, mi.price),
             category_id = COALESCE($2, mi.category_id),
             image = COALESCE($3, mi.image),
             sort_order = COALESCE($4, mi.sort_order),
             is_published = COALESCE($5, mi.is_published),
             updated_at = NOW()
       FROM categories c
       WHERE mi.id = $6
         AND c.id = mi.category_id
         AND c.menu_id = $7
       RETURNING mi.*`,
      [
        price,
        categoryId,
        req.file ? `/uploads/${req.file.filename}` : null,
        sortOrder,
        isPublished,
        itemId,
        menu.id
      ]
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

router.post("/items/bulk-delete", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter((n) => Number.isFinite(n) && n > 0) : [];
    if (!ids.length) {
      return res.status(400).json({ message: "En az bir ürün seçin." });
    }
    const result = await pool.query(
      `DELETE FROM menu_items mi
       USING categories c
       WHERE mi.id = ANY($1::int[])
         AND c.id = mi.category_id
         AND c.menu_id = $2`,
      [ids, menu.id]
    );
    return res.json({ deleted: result.rowCount });
  } catch (error) {
    return next(error);
  }
});

/* ---------- Masalar & garson çağrıları ---------- */

router.get("/tables", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
    const r = await pool.query(
      `SELECT id, label, token, sort_order FROM menu_tables WHERE menu_id = $1 ORDER BY sort_order ASC, id ASC`,
      [menu.id]
    );
    const tables = r.rows.map((row) => ({
      id: row.id,
      label: row.label,
      token: row.token,
      sort_order: row.sort_order,
      menu_url: `${base}/menu/${encodeURIComponent(menu.slug)}?t=${encodeURIComponent(row.token)}`
    }));
    return res.json({ slug: menu.slug, tables });
  } catch (error) {
    return next(error);
  }
});

router.post("/tables", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const label = String(req.body?.label || "").trim();
    if (!label) {
      return res.status(400).json({ message: "Masa adı gerekli." });
    }
    const sortOrder = Number(req.body?.sort_order) || 0;
    const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
    for (let attempt = 0; attempt < 6; attempt++) {
      const token = crypto.randomBytes(16).toString("hex");
      try {
        const ins = await pool.query(
          `INSERT INTO menu_tables (menu_id, label, token, sort_order) VALUES ($1, $2, $3, $4)
           RETURNING id, label, token, sort_order`,
          [menu.id, label, token, sortOrder]
        );
        const row = ins.rows[0];
        return res.status(201).json({
          ...row,
          menu_url: `${base}/menu/${encodeURIComponent(menu.slug)}?t=${encodeURIComponent(row.token)}`
        });
      } catch (e) {
        if (e.code === "23505") {
          continue;
        }
        throw e;
      }
    }
    return res.status(500).json({ message: "Masa oluşturulamadı." });
  } catch (error) {
    return next(error);
  }
});

router.get("/tables/:id/qr", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const tableId = Number(req.params.id);
    const r = await pool.query(`SELECT id, token FROM menu_tables WHERE id = $1 AND menu_id = $2`, [
      tableId,
      menu.id
    ]);
    if (!r.rows[0]) {
      return res.status(404).json({ message: "Masa bulunamadı." });
    }
    const qrPath = await generateTableQr(menu.id, tableId, menu.slug, r.rows[0].token);
    return res.download(path.resolve(process.cwd(), qrPath.replace(/^\//, "")));
  } catch (error) {
    return next(error);
  }
});

router.delete("/tables/:id", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const tableId = Number(req.params.id);
    const result = await pool.query(`DELETE FROM menu_tables WHERE id = $1 AND menu_id = $2 RETURNING id`, [
      tableId,
      menu.id
    ]);
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Masa bulunamadı." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get("/waiter-calls/pending", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const calls = await fetchPendingCallsForMenu(menu.id);
    return res.json({ calls });
  } catch (error) {
    return next(error);
  }
});

router.post("/waiter-calls/:id/resolve", async (req, res, next) => {
  try {
    const menu = await getOwnedMenu(req);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const callId = Number(req.params.id);
    const result = await pool.query(
      `UPDATE waiter_calls SET resolved_at = NOW()
       WHERE id = $1 AND menu_id = $2 AND resolved_at IS NULL
       RETURNING id`,
      [callId, menu.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Çağrı bulunamadı." });
    }
    await broadcastWaiterCalls(menu.id);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
