-- ============================================================================
-- EGGIFY – Fresh Egg Market | SQLite Relational Database Schema
-- ไฟล์: database/schema.sql
-- รองรับการจัดเก็บข้อมูลผู้ใช้ (ระบบล็อกอิน), สินค้า, คำสั่งซื้อ และรายการสินค้าย่อย
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_key TEXT NOT NULL DEFAULT 'chicken',
  badge TEXT DEFAULT 'สดจากฟาร์ม',
  price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  unit TEXT DEFAULT 'แพ็กมาตรฐาน',
  egg_type TEXT DEFAULT 'brown',
  weight TEXT DEFAULT 'ขนาดมาตรฐาน',
  nutrition TEXT DEFAULT 'อุดมด้วยโปรตีนและวิตามิน',
  farm_origin TEXT DEFAULT 'ฟาร์มเอ้กอิฟาย นครปฐม',
  description TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_slot TEXT DEFAULT 'รอบเช้าด่วน (08:00 - 12:00 น.)',
  note TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'QR PromptPay',
  subtotal REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  shipping REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'รอดำเนินการ' CHECK (status IN ('รอดำเนินการ', 'กำลังจัดส่ง', 'จัดส่งแล้ว')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id INTEGER,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  qty INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

