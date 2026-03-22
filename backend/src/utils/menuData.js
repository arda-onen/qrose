import { pool } from "../db/pool.js";

/**
 * @param {number} menuId
 * @param {{ forPublic?: boolean }} [options] forPublic=true: sadece yayında ürünler
 */
export async function getFullMenuByMenuId(menuId, options = {}) {
  const { forPublic = false } = options;
  const menuResult = await pool.query(
    `SELECT
       id,
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
     FROM menus
     WHERE id = $1`,
    [menuId]
  );
  const menu = menuResult.rows[0];
  if (!menu) {
    return null;
  }

  const categoriesResult = await pool.query(
    `SELECT
       id,
       menu_id,
       name,
       short_description,
       image,
       sort_order
     FROM categories
     WHERE menu_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [menuId]
  );

  const categories = [];
  for (const category of categoriesResult.rows) {
    const catTransResult = await pool.query(
      "SELECT id, category_id, language_code, name, short_description FROM category_translations WHERE category_id = $1",
      [category.id]
    );
    let translations = catTransResult.rows;
    const langOrder = menu.supported_languages || [];
    translations = [...translations].sort((a, b) => {
      const ia = langOrder.indexOf(a.language_code);
      const ib = langOrder.indexOf(b.language_code);
      const sa = ia === -1 ? 999 : ia;
      const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) {
        return sa - sb;
      }
      return String(a.language_code).localeCompare(String(b.language_code));
    });

    const itemsResult = await pool.query(
      `SELECT
         id,
         category_id,
         price::float8 AS price,
         image,
         sort_order,
         created_at,
         is_published,
         updated_at
       FROM menu_items
       WHERE category_id = $1
         ${forPublic ? "AND is_published = true" : ""}
       ORDER BY sort_order ASC, id ASC`,
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

    categories.push({ ...category, translations, items });
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
  return getFullMenuByMenuId(result.rows[0].id, { forPublic: false });
}

export async function getMenuBySlug(slug) {
  const menuResult = await pool.query("SELECT id FROM menus WHERE slug = $1", [slug]);
  if (!menuResult.rows[0]) {
    return null;
  }
  return getFullMenuByMenuId(menuResult.rows[0].id, { forPublic: true });
}
