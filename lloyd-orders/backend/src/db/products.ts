import { db } from "./database.js";
import { ensureCategory, findCategoryByName } from "./categories.js";
import { defaultProducts } from "./defaultProducts.js";
import type { Product, ProductInput } from "../types/product.js";

type ProductRow = {
  id: number;
  name: string;
  category: string;
  category_priority: number;
  print_priority: number;
  optional_flag: string | null;
  price: number;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    categoryPriority: row.category_priority,
    printPriority: row.print_priority,
    price: row.price,
    ...(row.optional_flag ? { optionalFlag: row.optional_flag } : {})
  };
}

function categoryPriorityFor(input: ProductInput) {
  const category = findCategoryByName(input.category);
  if (category) {
    return category.priority;
  }

  if (typeof input.categoryPriority === "number") {
    ensureCategory({ name: input.category, priority: input.categoryPriority });
    return input.categoryPriority;
  }

  throw new Error("Category does not exist");
}

function hasSetting(key: string) {
  const row = db.prepare("SELECT value FROM app_settings WHERE key = ?").get(key) as { value: string } | undefined;
  return Boolean(row);
}

function setSetting(key: string, value: string) {
  db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)").run(key, value);
}

export function seedProductsIfEmpty() {
  const seedCategories = db.transaction((products: ProductInput[]) => {
    const seen = new Set<string>();
    for (const product of products) {
      if (!seen.has(product.category)) {
        ensureCategory({ name: product.category, priority: product.categoryPriority ?? 999 });
        seen.add(product.category);
      }
    }
  });
  seedCategories(defaultProducts);

  const count = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (count.count > 0) {
    return;
  }

  const insert = db.prepare(
    "INSERT INTO products (name, category, category_priority, print_priority, price, optional_flag) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const seed = db.transaction((products: ProductInput[]) => {
    for (const product of products) {
      const categoryPriority = categoryPriorityFor(product);
      insert.run(product.name, product.category, categoryPriority, product.printPriority, product.price, product.optionalFlag ?? null);
    }
  });

  seed(defaultProducts);
}

function ensureCategoriesFromExistingProducts() {
  const rows = db
    .prepare(
      "SELECT category AS name, MIN(category_priority) AS priority FROM products GROUP BY category ORDER BY category_priority ASC, category ASC"
    )
    .all() as Array<{ name: string; priority: number }>;

  for (const row of rows) {
    ensureCategory({ name: row.name, priority: row.priority });
  }
}

function productExists(name: string) {
  const row = db.prepare("SELECT id FROM products WHERE name = ?").get(name) as { id: number } | undefined;
  return Boolean(row);
}

function ensureProduct(input: ProductInput) {
  if (productExists(input.name)) {
    return;
  }

  const categoryPriority = categoryPriorityFor(input);
  db.prepare("INSERT INTO products (name, category, category_priority, print_priority, price, optional_flag) VALUES (?, ?, ?, ?, ?, ?)").run(
    input.name,
    input.category,
    categoryPriority,
    input.printPriority,
    input.price,
    input.optionalFlag ?? null
  );
}

export function applyProductPatches() {
  db.prepare("UPDATE products SET name = ? WHERE name = ?").run("Hladni Nescafe vanilija", "Hladni Nescafe");
  ensureProduct({
    name: "Hladni Nescafe cokolada",
    category: "Hladne kave",
    categoryPriority: 11,
    printPriority: 20,
    price: 3
  });
  db.prepare("UPDATE products SET print_priority = ? WHERE name = ? AND print_priority = ?").run(30, "Ice coffee", 999);

  if (hasSetting("default_optional_flags_applied")) {
    return;
  }

  db.prepare("UPDATE products SET optional_flag = ? WHERE name = ? AND optional_flag IS NULL").run("Produzeni", "Espresso kava");
  db.prepare("UPDATE products SET optional_flag = ? WHERE name = ? AND optional_flag IS NULL").run("No sugar", "Ice coffee");
  db.prepare("UPDATE products SET optional_flag = ? WHERE name IN (?, ?, ?) AND optional_flag IS NULL").run(
    "0.5L",
    "Cedevita limun",
    "Cedevita naranca",
    "Cedevita naranča"
  );
  db.prepare("UPDATE products SET optional_flag = ? WHERE name = ? AND optional_flag IS NULL").run("0.5L", "Pago crni ribiz");
  db.prepare("UPDATE products SET optional_flag = ? WHERE category IN (?, ?) AND optional_flag IS NULL").run("Double", "Spirits", "Liqueurs");
  setSetting("default_optional_flags_applied", new Date().toISOString());
}

export function listProducts(): Product[] {
  const rows = db
    .prepare("SELECT * FROM products ORDER BY category_priority ASC, print_priority ASC, name ASC")
    .all() as ProductRow[];

  return rows.map(toProduct);
}

export function createProduct(input: ProductInput): Product {
  const categoryPriority = categoryPriorityFor(input);
  const result = db
    .prepare("INSERT INTO products (name, category, category_priority, print_priority, price, optional_flag) VALUES (?, ?, ?, ?, ?, ?)")
    .run(input.name, input.category, categoryPriority, input.printPriority, input.price, input.optionalFlag ?? null);

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(result.lastInsertRowid) as ProductRow;
  return toProduct(row);
}

export function updateProduct(id: number, input: ProductInput): Product | null {
  const categoryPriority = categoryPriorityFor(input);
  db.prepare(
    "UPDATE products SET name = ?, category = ?, category_priority = ?, print_priority = ?, price = ?, optional_flag = ? WHERE id = ?"
  ).run(input.name, input.category, categoryPriority, input.printPriority, input.price, input.optionalFlag ?? null, id);

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
  return row ? toProduct(row) : null;
}

export function deleteProduct(id: number) {
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return result.changes > 0;
}

seedProductsIfEmpty();
ensureCategoriesFromExistingProducts();
applyProductPatches();
