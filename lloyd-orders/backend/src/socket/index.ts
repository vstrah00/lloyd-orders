import type { Server } from "socket.io";
import { completeOrder, createOrder } from "../db/database.js";
import { validateCreateOrder } from "../validation/orders.js";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    socket.on("order:create", (payload, ack) => {
      try {
        const input = validateCreateOrder(payload);
        const order = createOrder(input);
        io.emit("order:new", order);
        ack?.({ ok: true, order });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Invalid order" });
      }
    });

    socket.on("order:complete", (payload, ack) => {
      const id = Number(payload?.id);
      if (!Number.isInteger(id) || id <= 0) {
        ack?.({ ok: false, error: "Invalid order id" });
        return;
      }

      const order = completeOrder(id);
      if (!order) {
        ack?.({ ok: false, error: "Order not found" });
        return;
      }

      io.emit("order:updated", order);
      ack?.({ ok: true, order });
    });
  });
}
