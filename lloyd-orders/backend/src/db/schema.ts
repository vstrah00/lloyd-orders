import type Database from "better-sqlite3";

export function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      items TEXT NOT NULL,
      printed_at TEXT,
      status TEXT NOT NULL DEFAULT 'new'
    );
  `);

  const columns = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "printed_at")) {
    db.exec("ALTER TABLE orders ADD COLUMN printed_at TEXT");
  }
}
