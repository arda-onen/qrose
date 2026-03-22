CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'restaurant')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  theme TEXT NOT NULL,
  color_palette TEXT NOT NULL DEFAULT 'sunset',
  brand_icon TEXT,
  hero_image TEXT,
  shop_description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address_line TEXT,
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['en']::TEXT[],
  owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS color_palette TEXT NOT NULL DEFAULT 'sunset';

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS brand_icon TEXT;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS hero_image TEXT;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS shop_description TEXT;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE menus
ADD COLUMN IF NOT EXISTS address_line TEXT;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_description TEXT,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS short_description TEXT;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS image TEXT;

CREATE TABLE IF NOT EXISTS category_translations (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT DEFAULT '',
  UNIQUE(category_id, language_code)
);

INSERT INTO category_translations (category_id, language_code, name, short_description)
SELECT c.id, lang, c.name, COALESCE(c.short_description, '')
FROM categories c
JOIN menus m ON m.id = c.menu_id
CROSS JOIN LATERAL unnest(m.supported_languages) AS lang
WHERE NOT EXISTS (SELECT 1 FROM category_translations ct WHERE ct.category_id = c.id);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS menu_item_translations (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  UNIQUE(menu_item_id, language_code)
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS menu_daily_views (
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  view_date DATE NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (menu_id, view_date)
);

CREATE TABLE IF NOT EXISTS menu_item_view_totals (
  menu_item_id INTEGER PRIMARY KEY REFERENCES menu_items(id) ON DELETE CASCADE,
  view_count BIGINT NOT NULL DEFAULT 0
);

/** Masa QR’ları: her kayıt bir masa; token URL’de ?t= ile kullanılır */
CREATE TABLE IF NOT EXISTS menu_tables (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS menu_tables_menu_id_idx ON menu_tables (menu_id);

/** Garson çağırma: çözülmemiş kayıt masa başına en fazla bir (partial unique) */
CREATE TABLE IF NOT EXISTS waiter_calls (
  id SERIAL PRIMARY KEY,
  menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  table_id INTEGER NOT NULL REFERENCES menu_tables(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS waiter_calls_one_open_per_table
ON waiter_calls (table_id)
WHERE resolved_at IS NULL;

CREATE INDEX IF NOT EXISTS waiter_calls_menu_pending_idx
ON waiter_calls (menu_id)
WHERE resolved_at IS NULL;
