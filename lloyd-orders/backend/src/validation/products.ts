import type { ProductInput } from "../types/product.js";

export function validateProduct(payload: unknown): ProductInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Product payload is required");
  }

  const input = payload as Partial<ProductInput>;
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new Error("Name is required");
  }

  if (typeof input.category !== "string" || input.category.trim().length === 0) {
    throw new Error("Category is required");
  }

  if (typeof input.printPriority !== "number" || input.printPriority < 0) {
    throw new Error("Print priority is required");
  }

  if (typeof input.price !== "number" || input.price < 0) {
    throw new Error("Price is required");
  }

  return {
    name: input.name.trim(),
    category: input.category.trim(),
    printPriority: input.printPriority,
    price: input.price,
    ...(typeof input.categoryPriority === "number" ? { categoryPriority: input.categoryPriority } : {}),
    ...(typeof input.optionalFlag === "string" && input.optionalFlag.trim() ? { optionalFlag: input.optionalFlag.trim() } : {})
  };
}
