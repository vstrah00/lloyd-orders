import type { WaiterInput } from "../types/waiter.js";

export function validateWaiter(payload: unknown): WaiterInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Waiter payload is required");
  }

  const input = payload as Partial<WaiterInput>;
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    throw new Error("Waiter name is required");
  }

  return {
    name: input.name.trim()
  };
}
