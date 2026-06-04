import { Router } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../db/categories.js";
import { validateCategory } from "../validation/categories.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", (_req, res) => {
  res.json(listCategories());
});

categoriesRouter.post("/", (req, res) => {
  try {
    res.status(201).json(createCategory(validateCategory(req.body)));
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid category" });
  }
});

categoriesRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }

  try {
    const category = updateCategory(id, validateCategory(req.body));
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid category" });
  }
});

categoriesRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid category id" });
    return;
  }

  const result = deleteCategory(id);
  if (result.inUse) {
    res.status(400).json({ error: "Category still has products" });
    return;
  }

  if (!result.deleted) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.status(204).send();
});
