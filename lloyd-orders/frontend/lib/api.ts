import type { Order, OrderItem } from "./types";

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function fetchNewOrders(): Promise<Order[]> {
  const response = await fetch(`${backendUrl}/orders?status=new`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load orders");
  }

  return response.json();
}

export async function createOrder(tableLabel: string, items: OrderItem[], note?: string): Promise<Order> {
  const response = await fetch(`${backendUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableLabel, items, note })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to send order");
  }

  return response.json();
}

export async function completeOrder(id: number): Promise<Order> {
  const response = await fetch(`${backendUrl}/orders/${id}/complete`, { method: "PATCH" });
  if (!response.ok) {
    throw new Error("Failed to complete order");
  }

  return response.json();
}
