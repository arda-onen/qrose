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
