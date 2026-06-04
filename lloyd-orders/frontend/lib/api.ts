import type { Category, CategoryInput, Order, OrderItem, Product, ProductInput, Waiter, WaiterInput } from "./types";

export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function fetchNewOrders(): Promise<Order[]> {
  const response = await fetch(`${backendUrl}/orders?status=new`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load orders");
  }

  return response.json();
}

export async function createOrder(tableLabel: string, items: OrderItem[], note?: string, waiterName?: string): Promise<Order> {
  const response = await fetch(`${backendUrl}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableLabel, items, note, waiterName })
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

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${backendUrl}/products`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const response = await fetch(`${backendUrl}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to create product");
  }

  return response.json();
}

export async function updateProduct(id: number, input: ProductInput): Promise<Product> {
  const response = await fetch(`${backendUrl}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to update product");
  }

  return response.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/products/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to delete product");
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${backendUrl}/categories`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load categories");
  }

  return response.json();
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const response = await fetch(`${backendUrl}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to create category");
  }

  return response.json();
}

export async function updateCategory(id: number, input: CategoryInput): Promise<Category> {
  const response = await fetch(`${backendUrl}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to update category");
  }

  return response.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/categories/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to delete category");
  }
}

export async function fetchWaiters(): Promise<Waiter[]> {
  const response = await fetch(`${backendUrl}/waiters`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load waiters");
  }

  return response.json();
}

export async function createWaiter(input: WaiterInput): Promise<Waiter> {
  const response = await fetch(`${backendUrl}/waiters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to create waiter");
  }

  return response.json();
}

export async function updateWaiter(id: number, input: WaiterInput): Promise<Waiter> {
  const response = await fetch(`${backendUrl}/waiters/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to update waiter");
  }

  return response.json();
}

export async function deleteWaiter(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/waiters/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to delete waiter");
  }
}
