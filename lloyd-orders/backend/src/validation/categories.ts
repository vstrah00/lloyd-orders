import type { CategoryInput } from "../types/category.js";

export function validateCategory(payload: unknown): CategoryInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Category payload is required");
  }

  const input = payload as Partial<CategoryInput>;
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new Error("Category name is required");
  }

  if (typeof input.priority !== "number" || input.priority < 0) {
    throw new Error("Category priority is required");
  }

  return {
    name: input.name.trim(),
    priority: input.priority
  };
}
