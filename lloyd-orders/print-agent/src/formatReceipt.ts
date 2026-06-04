import type { Order } from "./types.js";

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

function sanitize(text: string) {
  return text
    .replace(/[čć]/g, "c")
    .replace(/[ČĆ]/g, "C")
    .replace(/š/g, "s")
    .replace(/Š/g, "S")
    .replace(/ž/g, "z")
    .replace(/Ž/g, "Z")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function groupOrderItems(items: Order["items"]) {
  const groups = new Map<string, { category: string; categoryPriority: number; items: Order["items"] }>();

  for (const item of items.filter((item) => item.category !== "Note")) {
    const existing = groups.get(item.category);
    if (existing) existing.items.push(item);
    else groups.set(item.category, { category: item.category, categoryPriority: item.categoryPriority, items: [item] });
  }

  return [...groups.values()]
    .sort((a, b) => a.categoryPriority - b.categoryPriority || a.category.localeCompare(b.category))
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => a.printPriority - b.printPriority || a.name.localeCompare(b.name))
    }));
}

export function formatReceipt(order: Order) {
  const groups = groupOrderItems(order.items);
  const noteItems = order.items.filter((item) => item.category === "Note");
  const total = order.items
    .filter((item) => item.category !== "Note")
    .reduce((sum, item) => sum + item.quantity * item.price, 0);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
    width: 80mm;
    margin: 0;
    padding: 4mm;
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
  }

  /* TABLE G3 */
  h1 {
    font-size: 28px;      /* was 34-36 */
    text-align: center;
    margin: 0 0 2mm 0;
    font-weight: 900;
  }

  /* timestamp */
  .time {
    text-align: center;
    font-size: 16px;
    font-weight: normal;
    margin-bottom: 5mm;
  }

  /* categories */
  h2 {
    font-size: 18px;      /* was 24-27 */
    margin: 5mm 0 2mm 0;
    border-bottom: 2px solid black;
    font-weight: 900;
  }

  /* products */
  .item {
    font-size: 20px;
    margin: 1.5mm 0;
    line-height: 1.2;
  }

  /* total */
  .total {
    font-size: 24px;
    text-align: center;
    margin-top: 6mm;
    border-top: 3px solid black;
    padding-top: 3mm;
    font-weight: 900;
  }
  </style>
</head>
<body>
  <h1>TABLE ${sanitize(order.tableLabel)}</h1>
  <div class="time">${formatTime(order.timestamp)}</div>

  ${noteItems.length ? `<div class="note">NOTE: ${sanitize(noteItems.map((item) => item.name.replace(/^NOTE:\\s*/, "")).join(" "))}</div>` : ""}

  ${groups.map((group) => `
    <h2>${sanitize(group.category.toUpperCase())}</h2>
    ${group.items.map((item) => `<div class="item">${item.quantity}x ${sanitize(item.name)}</div>`).join("")}
  `).join("")}

  <div class="total">TOTAL: ${total.toFixed(2)} EUR</div>
</body>
</html>`;
}