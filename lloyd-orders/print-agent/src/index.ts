import "dotenv/config";
import { formatReceipt } from "./formatReceipt.js";
import { printReceipt } from "./printer.js";
import type { Order } from "./types.js";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:4000";
const pollIntervalMs = Number(process.env.PRINT_POLL_INTERVAL_MS ?? 5000);

async function fetchUnprintedOrders(): Promise<Order[]> {
  const response = await fetch(`${backendUrl}/orders/unprinted`);
  if (!response.ok) {
    throw new Error(`Failed to fetch unprinted orders: ${response.status}`);
  }

  return response.json() as Promise<Order[]>;
}

async function markPrinted(orderId: number) {
  const response = await fetch(`${backendUrl}/orders/${orderId}/printed`, {
    method: "PATCH"
  });

  if (!response.ok) {
    throw new Error(`Failed to mark order ${orderId} printed: ${response.status}`);
  }
}

async function printPendingOrders() {
  const orders = await fetchUnprintedOrders();

  for (const order of orders) {
    const receipt = formatReceipt(order);
    await printReceipt(receipt);
    await markPrinted(order.id);
    console.log(`Printed order ${order.id} for table ${order.tableLabel}`);
  }
}

async function poll() {
  try {
    await printPendingOrders();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    setTimeout(poll, pollIntervalMs);
  }
}

console.log(`Print agent polling ${backendUrl} every ${pollIntervalMs}ms`);
poll();
