import type Database from "better-sqlite3";

export function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      items TEXT NOT NULL,
      printed_at TEXT,
      waiter_name TEXT,
      status TEXT NOT NULL DEFAULT 'new'
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      category_priority INTEGER NOT NULL,
      print_priority REAL NOT NULL,
      optional_flag TEXT,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      priority INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS waiters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const columns = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "printed_at")) {
    db.exec("ALTER TABLE orders ADD COLUMN printed_at TEXT");
  }
  if (!columns.some((column) => column.name === "waiter_name")) {
    db.exec("ALTER TABLE orders ADD COLUMN waiter_name TEXT");
  }

  const productColumns = db.prepare("PRAGMA table_info(products)").all() as Array<{ name: string }>;
  if (!productColumns.some((column) => column.name === "optional_flag")) {
    db.exec("ALTER TABLE products ADD COLUMN optional_flag TEXT");
  }
}
