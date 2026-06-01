import { Router } from "express";
import { completeOrder, createOrder, listOrders, listUnprintedOrders, markOrderPrinted } from "../db/database.js";
import { validateCreateOrder } from "../validation/orders.js";
import type { Server } from "socket.io";
import type { OrderStatus } from "../types/order.js";

export function createOrdersRouter(io: Server) {
  const router = Router();

  router.get("/", (req, res) => {
    const status = typeof req.query.status === "string" ? (req.query.status as OrderStatus) : undefined;
    if (status && status !== "new" && status !== "completed") {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    res.json(listOrders(status));
  });

  router.get("/unprinted", (_req, res) => {
    res.json(listUnprintedOrders());
  });

  router.post("/", (req, res) => {
    try {
      const input = validateCreateOrder(req.body);
      const order = createOrder(input);
      io.emit("order:new", order);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid order" });
    }
  });

  router.patch("/:id/complete", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = completeOrder(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    io.emit("order:updated", order);
    res.json(order);
  });

  router.patch("/:id/printed", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid order id" });
      return;
    }

    const order = markOrderPrinted(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  });

  return router;
}
