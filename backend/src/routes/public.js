import express from "express";
import { pool } from "../db/pool.js";
import { getMenuBySlug } from "../utils/menuData.js";
import { broadcastWaiterCalls } from "../utils/waiterCalls.js";

const router = express.Router();

/** Aynı IP + masa için çok sık çağrıyı sınırla (basit bellek içi) */
const waiterRate = new Map();
const WAITER_CALL_MIN_MS = 8000;

function allowWaiterCall(ip, key) {
  const k = `${ip}:${key}`;
  const now = Date.now();
  const last = waiterRate.get(k) || 0;
  if (now - last < WAITER_CALL_MIN_MS) {
    return false;
  }
  waiterRate.set(k, now);
  if (waiterRate.size > 50000) {
    waiterRate.clear();
  }
  return true;
}

router.get("/menu/:slug", async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    return res.json(menu);
  } catch (error) {
    return next(error);
  }
});

/** Menü görüntüleme ve ürün gösterim sayıları (halka açık, auth yok) */
router.post("/track/menu/:slug", async (req, res, next) => {
  try {
    const menuResult = await pool.query("SELECT id FROM menus WHERE slug = $1", [req.params.slug]);
    if (!menuResult.rows[0]) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const menuId = menuResult.rows[0].id;
    const { itemIds = [] } = req.body || {};
    const ids = Array.isArray(itemIds) ? itemIds.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0) : [];

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const today = new Date().toISOString().slice(0, 10);
      await client.query(
        `INSERT INTO menu_daily_views (menu_id, view_date, view_count)
         VALUES ($1, $2::date, 1)
         ON CONFLICT (menu_id, view_date)
         DO UPDATE SET view_count = menu_daily_views.view_count + 1`,
        [menuId, today]
      );

      for (const itemId of ids) {
        const check = await client.query(
          `SELECT 1 FROM menu_items mi
           INNER JOIN categories c ON c.id = mi.category_id
           WHERE mi.id = $1 AND c.menu_id = $2 AND mi.is_published = true`,
          [itemId, menuId]
        );
        if (check.rows[0]) {
          await client.query(
            `INSERT INTO menu_item_view_totals (menu_item_id, view_count)
             VALUES ($1, 1)
             ON CONFLICT (menu_item_id)
             DO UPDATE SET view_count = menu_item_view_totals.view_count + 1`,
            [itemId]
          );
        }
      }

      await client.query("COMMIT");
      return res.status(204).send();
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    return next(error);
  }
});

/** Garson çağır (halka açık; masa token menüye ait olmalı) */
router.post("/menu/:slug/waiter-call", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const { tableToken } = req.body || {};
    const token = typeof tableToken === "string" ? tableToken.trim() : "";
    if (!token) {
      return res.status(400).json({ message: "Masa bilgisi gerekli." });
    }

    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    if (!allowWaiterCall(ip, `${slug}:${token}`)) {
      return res.status(429).json({ message: "Çok sık istek. Birkaç saniye sonra tekrar deneyin." });
    }

    const menuResult = await pool.query("SELECT id FROM menus WHERE slug = $1", [slug]);
    if (!menuResult.rows[0]) {
      return res.status(404).json({ message: "Menu not found." });
    }
    const menuId = menuResult.rows[0].id;

    const tableResult = await pool.query(
      `SELECT id, label FROM menu_tables WHERE menu_id = $1 AND token = $2`,
      [menuId, token]
    );
    if (!tableResult.rows[0]) {
      return res.status(404).json({ message: "Masa bulunamadı." });
    }
    const tableId = tableResult.rows[0].id;

    const upd = await pool.query(
      `UPDATE waiter_calls
         SET requested_at = NOW()
       WHERE table_id = $1 AND resolved_at IS NULL
       RETURNING id, menu_id, table_id, requested_at`,
      [tableId]
    );

    if (upd.rows[0]) {
      await broadcastWaiterCalls(menuId);
      return res.json({ ok: true, message: "Garson çağrısı güncellendi." });
    }

    await pool.query(`INSERT INTO waiter_calls (menu_id, table_id) VALUES ($1, $2)`, [menuId, tableId]);
    await broadcastWaiterCalls(menuId);
    return res.json({ ok: true, message: "Garson çağrıldı." });
  } catch (error) {
    return next(error);
  }
});

export default router;
