import { Router } from "express";
import { createWaiter, deleteWaiter, listWaiters, updateWaiter } from "../db/waiters.js";
import { validateWaiter } from "../validation/waiters.js";

export const waitersRouter = Router();

waitersRouter.get("/", (_req, res) => {
  res.json(listWaiters());
});

waitersRouter.post("/", (req, res) => {
  try {
    res.status(201).json(createWaiter(validateWaiter(req.body)));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid waiter" });
  }
});

waitersRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid waiter id" });
    return;
  }

  try {
    const waiter = updateWaiter(id, validateWaiter(req.body));
    if (!waiter) {
      res.status(404).json({ error: "Waiter not found" });
      return;
    }

    res.json(waiter);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid waiter" });
  }
});

waitersRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid waiter id" });
    return;
  }

  if (!deleteWaiter(id)) {
    res.status(404).json({ error: "Waiter not found" });
    return;
  }

  res.status(204).send();
});
