import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ensureSchema } from "./schema.js";
import type { CreateOrderInput, Order, OrderStatus } from "../types/order.js";

type OrderRow = {
  id: number;
  table_number: string | number;
  timestamp: string;
  items: string;
  printed_at: string | null;
  status: OrderStatus;
};

const databasePath = process.env.DATABASE_PATH ?? "./data/lloyd-orders.sqlite";
const resolvedDatabasePath = path.resolve(databasePath);
fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

export const db = new Database(resolvedDatabasePath);
ensureSchema(db);

function toOrder(row: OrderRow): Order {
  const parsedItems = JSON.parse(row.items) as Array<Partial<Order["items"][number]>>;

  return {
    id: row.id,
    tableLabel: String(row.table_number),
    timestamp: row.timestamp,
    items: parsedItems.map((item, index) => ({
      name: typeof item.name === "string" ? item.name : "Unknown item",
      category: typeof item.category === "string" ? item.category : "Unsorted",
      categoryPriority: typeof item.categoryPriority === "number" ? item.categoryPriority : 999,
      printPriority: typeof item.printPriority === "number" ? item.printPriority : index,
      price: typeof item.price === "number" ? item.price : 0,
      quantity: typeof item.quantity === "number" ? item.quantity : 1
    })),
    printedAt: row.printed_at,
    status: row.status
  };
}

export function listOrders(status?: OrderStatus): Order[] {
  const rows = status
    ? db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY timestamp DESC").all(status)
    : db.prepare("SELECT * FROM orders ORDER BY timestamp DESC").all();

  return (rows as OrderRow[]).map(toOrder);
}

export function listUnprintedOrders(): Order[] {
  const rows = db
    .prepare("SELECT * FROM orders WHERE status = 'new' AND printed_at IS NULL ORDER BY timestamp ASC")
    .all() as OrderRow[];

  return rows.map(toOrder);
}

export function createOrder(input: CreateOrderInput): Order {
  const timestamp = new Date().toISOString();
  const items = input.note ? [...input.items, createNoteItem(input.note)] : input.items;
  const result = db
    .prepare("INSERT INTO orders (table_number, timestamp, items, status) VALUES (?, ?, ?, 'new')")
    .run(input.tableLabel, timestamp, JSON.stringify(items));

  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(result.lastInsertRowid) as OrderRow;
  return toOrder(row);
}

function createNoteItem(note: string): Order["items"][number] {
  return {
    name: `NOTE: ${note}`,
    category: "Note",
    categoryPriority: 0,
    printPriority: 0,
    price: 0,
    quantity: 1
  };
}

export function completeOrder(id: number): Order | null {
  db.prepare("UPDATE orders SET status = 'completed' WHERE id = ?").run(id);
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrder(row) : null;
}

export function markOrderPrinted(id: number): Order | null {
  const printedAt = new Date().toISOString();
  db.prepare("UPDATE orders SET printed_at = ? WHERE id = ?").run(printedAt, id);
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrder(row) : null;
}
