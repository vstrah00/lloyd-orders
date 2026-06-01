import type { Order } from "./types.js";

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

export function formatReceipt(order: Order) {
  const groups = groupOrderItems(order.items);
  const noteGroup = groups.find((group) => group.category === "Note");
  const itemGroups = groups.filter((group) => group.category !== "Note");
  const total = order.items.filter((item) => item.category !== "Note").reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lines = [
    "--------------------------------",
    `TABLE ${order.tableLabel}`,
    formatTime(order.timestamp),
    "",
    ...(noteGroup ? [`NOTE: ${noteGroup.items.map((item) => item.name.replace(/^NOTE:\s*/, "")).join(" ")}`, ""] : []),
    ...itemGroups.flatMap((group) => [
      `=== ${group.category.toUpperCase()} ===`,
      ...group.items.map((item) => {
        const label = `${item.quantity}x ${item.name}`.padEnd(22, " ");
        return `${label} ${item.quantity} x ${formatEur(item.price)} = ${formatEur(item.quantity * item.price)}`;
      }),
      ""
    ]),
    `TOTAL: ${formatEur(total)}`,
    "",
    "--------------------------------",
    ""
  ];

  return lines.join("\n");
}

function formatEur(value: number) {
  return `${value.toFixed(2)}€`;
}

function groupOrderItems(items: Order["items"]) {
  const groups = new Map<string, { category: string; categoryPriority: number; items: Order["items"] }>();

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
