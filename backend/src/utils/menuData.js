import { pool } from "../db/pool.js";

export async function getFullMenuByMenuId(menuId) {
  const menuResult = await pool.query(
    "SELECT id, name, restaurant_name, slug, theme, color_palette, supported_languages, owner_user_id FROM menus WHERE id = $1",
    [menuId]
  );
  const menu = menuResult.rows[0];
  if (!menu) {
    return null;
  }

  const categoriesResult = await pool.query(
    "SELECT id, menu_id, name, sort_order FROM categories WHERE menu_id = $1 ORDER BY sort_order ASC, id ASC",
    [menuId]
  );

  const categories = [];
  for (const category of categoriesResult.rows) {
    const itemsResult = await pool.query(
      "SELECT id, category_id, price::float8 AS price, image, sort_order FROM menu_items WHERE category_id = $1 ORDER BY sort_order ASC, id ASC",
      [category.id]
    );
    const items = [];

    for (const item of itemsResult.rows) {
      const translationsResult = await pool.query(
        "SELECT id, menu_item_id, language_code, item_name, description FROM menu_item_translations WHERE menu_item_id = $1 ORDER BY language_code ASC",
        [item.id]
      );
      items.push({ ...item, translations: translationsResult.rows });
    }

    categories.push({ ...category, items });
  }

  return {
    ...menu,
    categories
  };
}

export async function getMenuByOwnerUserId(ownerUserId) {
  const result = await pool.query("SELECT id FROM menus WHERE owner_user_id = $1", [
    ownerUserId
  ]);
  if (!result.rows[0]) {
    return null;
  }
  return getFullMenuByMenuId(result.rows[0].id);
}

export async function getMenuBySlug(slug) {
  const menuResult = await pool.query("SELECT id FROM menus WHERE slug = $1", [slug]);
  if (!menuResult.rows[0]) {
    return null;
  }
  return getFullMenuByMenuId(menuResult.rows[0].id);
}
