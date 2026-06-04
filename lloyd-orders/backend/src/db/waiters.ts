import { db } from "./database.js";
import type { Waiter, WaiterInput } from "../types/waiter.js";

type WaiterRow = {
  id: number;
  name: string;
};

function toWaiter(row: WaiterRow): Waiter {
  return {
    id: row.id,
    name: row.name
  };
}

export function listWaiters(): Waiter[] {
  const rows = db.prepare("SELECT * FROM waiters ORDER BY name ASC").all() as WaiterRow[];
  return rows.map(toWaiter);
}

export function createWaiter(input: WaiterInput): Waiter {
  const result = db.prepare("INSERT INTO waiters (name) VALUES (?)").run(input.name);
  const row = db.prepare("SELECT * FROM waiters WHERE id = ?").get(result.lastInsertRowid) as WaiterRow;
  return toWaiter(row);
}

export function updateWaiter(id: number, input: WaiterInput): Waiter | null {
  db.prepare("UPDATE waiters SET name = ? WHERE id = ?").run(input.name, id);
  const row = db.prepare("SELECT * FROM waiters WHERE id = ?").get(id) as WaiterRow | undefined;
  return row ? toWaiter(row) : null;
}

export function deleteWaiter(id: number) {
  const result = db.prepare("DELETE FROM waiters WHERE id = ?").run(id);
  return result.changes > 0;
}
