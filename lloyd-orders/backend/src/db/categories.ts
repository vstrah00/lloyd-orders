import { db } from "./database.js";
import type { Category, CategoryInput } from "../types/category.js";

type CategoryRow = {
  id: number;
  name: string;
  priority: number;
};

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    priority: row.priority
  };
}

export function listCategories(): Category[] {
  const rows = db.prepare("SELECT * FROM categories ORDER BY priority ASC, name ASC").all() as CategoryRow[];
  return rows.map(toCategory);
}

export function findCategoryByName(name: string): Category | null {
  const row = db.prepare("SELECT * FROM categories WHERE name = ?").get(name) as CategoryRow | undefined;
  return row ? toCategory(row) : null;
}

export function ensureCategory(input: CategoryInput) {
  const existing = findCategoryByName(input.name);
  if (existing) {
    return existing;
  }

  const result = db.prepare("INSERT INTO categories (name, priority) VALUES (?, ?)").run(input.name, input.priority);
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid) as CategoryRow;
  return toCategory(row);
}

export function createCategory(input: CategoryInput): Category {
  const result = db.prepare("INSERT INTO categories (name, priority) VALUES (?, ?)").run(input.name, input.priority);
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(result.lastInsertRowid) as CategoryRow;
  return toCategory(row);
}

export function updateCategory(id: number, input: CategoryInput): Category | null {
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow | undefined;
  if (!existing) {
    return null;
  }

  const update = db.transaction(() => {
    db.prepare("UPDATE categories SET name = ?, priority = ? WHERE id = ?").run(input.name, input.priority, id);
    db.prepare("UPDATE products SET category = ?, category_priority = ? WHERE category = ?").run(
      input.name,
      input.priority,
      existing.name
    );
  });
  update();

  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow;
  return toCategory(row);
}

export function deleteCategory(id: number) {
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as CategoryRow | undefined;
  if (!existing) {
    return { deleted: false, inUse: false };
  }

  const usage = db.prepare("SELECT COUNT(*) AS count FROM products WHERE category = ?").get(existing.name) as { count: number };
  if (usage.count > 0) {
    return { deleted: false, inUse: true };
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return { deleted: true, inUse: false };
}
