import slugify from "slugify";
import { pool } from "../db/pool.js";

export async function createUniqueSlug(baseText) {
  const base = slugify(baseText, { lower: true, strict: true }) || "menu";
  let slug = base;
  let suffix = 1;

  while (true) {
    const { rowCount } = await pool.query(
      "SELECT 1 FROM menus WHERE slug = $1 LIMIT 1",
      [slug]
    );
    if (!rowCount) {
      return slug;
    }
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}
