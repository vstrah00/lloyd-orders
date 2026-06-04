import type { CreateOrderInput } from "../types/order.js";

export function validateCreateOrder(payload: unknown): CreateOrderInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Order payload is required");
  }

  const input = payload as Partial<CreateOrderInput>;
  const tableLabel = input.tableLabel;
  if (typeof tableLabel !== "string" || tableLabel.trim().length === 0) {
    throw new Error("Table is required");
  }

  const note = typeof input.note === "string" ? input.note.trim() : "";
  const waiterName = typeof input.waiterName === "string" ? input.waiterName.trim() : "";

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one item is required");
  }

  const items = input.items.map((item) => {
    if (!item || typeof item.name !== "string" || item.name.trim().length === 0) {
      throw new Error("Every item needs a name");
    }

    if (typeof item.category !== "string" || item.category.trim().length === 0) {
      throw new Error("Every item needs a category");
    }

    if (typeof item.categoryPriority !== "number" || item.categoryPriority < 0) {
      throw new Error("Every item needs a category priority");
    }

    if (typeof item.printPriority !== "number" || item.printPriority < 0) {
      throw new Error("Every item needs a print priority");
    }

    if (typeof item.price !== "number" || item.price < 0) {
      throw new Error("Every item needs a price");
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Every item needs a positive quantity");
    }

    return {
      name: item.name.trim(),
      category: item.category.trim(),
      categoryPriority: item.categoryPriority,
      printPriority: item.printPriority,
      price: item.price,
      quantity: item.quantity
    };
  });

  return {
    tableLabel: tableLabel.trim(),
    items,
    ...(note ? { note } : {}),
    ...(waiterName ? { waiterName } : {})
  };
}
