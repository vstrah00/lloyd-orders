import { Router } from "express";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../db/products.js";
import { validateProduct } from "../validation/products.js";

export const productsRouter = Router();

productsRouter.get("/", (_req, res) => {
  res.json(listProducts());
});

productsRouter.post("/", (req, res) => {
  try {
    const input = validateProduct(req.body);
    res.status(201).json(createProduct(input));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" });
  }
});

productsRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  try {
    const input = validateProduct(req.body);
    const product = updateProduct(id, input);
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid product" });
  }
});

productsRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  if (!deleteProduct(id)) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(204).send();
});
