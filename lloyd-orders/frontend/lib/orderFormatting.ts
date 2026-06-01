import type { OrderItem } from "./types";

export type GroupedOrderItems = {
  category: string;
  categoryPriority: number;
  items: OrderItem[];
};

export function formatEur(value: number) {
  return `${value.toFixed(2)}€`;
}

export function lineTotal(item: OrderItem) {
  return item.quantity * item.price;
}

export function orderTotal(items: OrderItem[]) {
  return items.filter((item) => item.category !== "Note").reduce((total, item) => total + lineTotal(item), 0);
}

export function groupOrderItems(items: OrderItem[]): GroupedOrderItems[] {
  const groups = new Map<string, GroupedOrderItems>();

  for (const item of items) {
    const existing = groups.get(item.category);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(item.category, {
        category: item.category,
        categoryPriority: item.categoryPriority,
        items: [item]
      });
    }
  }

  return [...groups.values()]
    .sort((left, right) => left.categoryPriority - right.categoryPriority || left.category.localeCompare(right.category))
    .map((group) => ({
      ...group,
      items: [...group.items].sort((left, right) => left.printPriority - right.printPriority || left.name.localeCompare(right.name))
    }));
}
