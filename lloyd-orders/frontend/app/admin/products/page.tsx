"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  createCategory,
  createProduct,
  createWaiter,
  deleteCategory,
  deleteProduct,
  deleteWaiter,
  fetchCategories,
  fetchProducts,
  fetchWaiters,
  updateCategory,
  updateProduct,
  updateWaiter
} from "@/lib/api";
import { formatEur } from "@/lib/orderFormatting";
import type { Category, CategoryInput, Product, ProductInput, Waiter } from "@/lib/types";

const emptyProductForm: ProductInput = {
  name: "",
  category: "",
  printPriority: 10,
  price: 0,
  optionalFlag: ""
};

const emptyCategoryForm: CategoryInput = {
  name: "",
  priority: 10
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [productForm, setProductForm] = useState<ProductInput>(emptyProductForm);
  const [categoryForm, setCategoryForm] = useState<CategoryInput>(emptyCategoryForm);
  const [waiterForm, setWaiterForm] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingWaiterId, setEditingWaiterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const loadedCategories = await fetchCategories();
      setCategories(loadedCategories);
      setProductForm((current) => (current.category || loadedCategories.length === 0 ? current : { ...current, category: loadedCategories[0].name }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load categories");
    }
  }

  async function loadWaiters() {
    try {
      setWaiters(await fetchWaiters());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load waiters");
    }
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadWaiters();
  }, []);

  function updateProductField<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setProductForm((current) => ({ ...current, [key]: value }));
  }

  function startProductEdit(product: Product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category: product.category,
      printPriority: product.printPriority,
      price: product.price,
      optionalFlag: product.optionalFlag ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetProductForm() {
    setEditingProductId(null);
    setProductForm({ ...emptyProductForm, category: categories[0]?.name ?? "" });
  }

  function startCategoryEdit(category: Category) {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, priority: category.priority });
  }

  function resetCategoryForm() {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  }

  function startWaiterEdit(waiter: Waiter) {
    setEditingWaiterId(waiter.id);
    setWaiterForm(waiter.name);
  }

  function resetWaiterForm() {
    setEditingWaiterId(null);
    setWaiterForm("");
  }

  async function submitProduct() {
    if (!productForm.category) {
      setMessage("Choose a category first");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const input = { ...productForm, optionalFlag: productForm.optionalFlag?.trim() || undefined };
      if (editingProductId) {
        await updateProduct(editingProductId, input);
        setMessage("Product updated");
      } else {
        await createProduct(input);
        setMessage("Product added");
      }

      resetProductForm();
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return;
    }

    setMessage(null);
    try {
      await deleteProduct(product.id);
      await loadProducts();
      setMessage("Product deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete product");
    }
  }

  async function submitCategory() {
    const name = categoryForm.name.trim();
    if (!name) {
      setMessage("Category name is required");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, { name, priority: categoryForm.priority });
        setMessage("Category updated");
      } else {
        await createCategory({ name, priority: categoryForm.priority });
        setMessage("Category added");
      }

      resetCategoryForm();
      await loadCategories();
      await loadProducts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Delete category ${category.name}?`)) {
      return;
    }

    setMessage(null);
    try {
      await deleteCategory(category.id);
      await loadCategories();
      setMessage("Category deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete category");
    }
  }

  async function submitWaiter() {
    const name = waiterForm.trim();
    if (!name) {
      setMessage("Waiter name is required");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      if (editingWaiterId) {
        await updateWaiter(editingWaiterId, { name });
        setMessage("Waiter updated");
      } else {
        await createWaiter({ name });
        setMessage("Waiter added");
      }

      resetWaiterForm();
      await loadWaiters();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save waiter");
    } finally {
      setSaving(false);
    }
  }

  async function removeWaiter(waiter: Waiter) {
    if (!window.confirm(`Delete waiter ${waiter.name}?`)) {
      return;
    }

    setMessage(null);
    try {
      await deleteWaiter(waiter.id);
      await loadWaiters();
      setMessage("Waiter deleted");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete waiter");
    }
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-5 text-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header>
          <p className="text-sm font-black uppercase text-sea">Lloyd Orders</p>
          <h1 className="text-3xl font-black">Products Admin</h1>
        </header>

        {message ? <p className="rounded-md bg-lime px-3 py-3 font-bold">{message}</p> : null}

        <section className="rounded-md border-2 border-ink bg-white p-4">
          <h2 className="mb-3 text-xl font-black">Waiters</h2>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <TextInput label="Name" value={waiterForm} onChange={setWaiterForm} />
            <ActionButtons
              editing={Boolean(editingWaiterId)}
              disabled={saving}
              onCancel={resetWaiterForm}
              onSubmit={submitWaiter}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {waiters.length === 0 ? (
              <p className="text-sm font-bold text-ink/55">No waiter names yet.</p>
            ) : (
              waiters.map((waiter) => (
                <Chip
                  key={waiter.id}
                  label={waiter.name}
                  onDelete={() => removeWaiter(waiter)}
                  onEdit={() => startWaiterEdit(waiter)}
                />
              ))
            )}
          </div>
        </section>

        <section className="rounded-md border-2 border-ink bg-white p-4">
          <h2 className="mb-3 text-xl font-black">Categories</h2>
          <div className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <TextInput label="Name" value={categoryForm.name} onChange={(value) => setCategoryForm((current) => ({ ...current, name: value }))} />
            <NumberInput
              label="Priority"
              value={categoryForm.priority}
              onChange={(value) => setCategoryForm((current) => ({ ...current, priority: value }))}
            />
            <ActionButtons
              editing={Boolean(editingCategoryId)}
              disabled={saving}
              onCancel={resetCategoryForm}
              onSubmit={submitCategory}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.length === 0 ? (
              <p className="text-sm font-bold text-ink/55">No categories yet.</p>
            ) : (
              categories.map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.priority} - ${category.name}`}
                  onDelete={() => removeCategory(category)}
                  onEdit={() => startCategoryEdit(category)}
                />
              ))
            )}
          </div>
        </section>

        <section className="rounded-md border-2 border-ink bg-white p-4">
          <h2 className="mb-3 text-xl font-black">{editingProductId ? "Edit product" : "Add product"}</h2>
          <div className="grid gap-3 md:grid-cols-[2fr_1.4fr_0.8fr_0.8fr_1fr_auto]">
            <TextInput label="Name" value={productForm.name} onChange={(value) => updateProductField("name", value)} />
            <SelectInput label="Category" value={productForm.category} options={categories.map((category) => category.name)} onChange={(value) => updateProductField("category", value)} />
            <NumberInput label="Print priority" value={productForm.printPriority} onChange={(value) => updateProductField("printPriority", value)} />
            <NumberInput label="Price" step="0.01" value={productForm.price} onChange={(value) => updateProductField("price", value)} />
            <TextInput label="Optional flag" value={productForm.optionalFlag ?? ""} onChange={(value) => updateProductField("optionalFlag", value)} />
            <ActionButtons
              editing={Boolean(editingProductId)}
              disabled={saving || categories.length === 0}
              onCancel={resetProductForm}
              onSubmit={submitProduct}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-md border-2 border-ink bg-white">
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="bg-ink text-white">
                <tr>
                  <HeaderCell>Name</HeaderCell>
                  <HeaderCell>Category</HeaderCell>
                  <HeaderCell>Category priority</HeaderCell>
                  <HeaderCell>Print priority</HeaderCell>
                  <HeaderCell>Price</HeaderCell>
                  <HeaderCell>Flag</HeaderCell>
                  <HeaderCell>Actions</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4 font-bold" colSpan={7}>
                      Loading products
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr className="border-t border-ink/10" key={product.id}>
                      <td className="p-3 font-black">{product.name}</td>
                      <td className="p-3 font-bold">{product.category}</td>
                      <td className="p-3 font-bold">{product.categoryPriority}</td>
                      <td className="p-3 font-bold">{product.printPriority}</td>
                      <td className="p-3 font-bold">{formatEur(product.price)}</td>
                      <td className="p-3 font-bold">{product.optionalFlag ?? "-"}</td>
                      <td className="flex gap-2 p-3">
                        <IconButton label={`Edit ${product.name}`} onClick={() => startProductEdit(product)}>
                          <Pencil aria-hidden className="h-4 w-4" />
                        </IconButton>
                        <IconButton danger label={`Delete ${product.name}`} onClick={() => removeProduct(product)}>
                          <Trash2 aria-hidden className="h-4 w-4" />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActionButtons({
  disabled,
  editing,
  onCancel,
  onSubmit
}: {
  disabled?: boolean;
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex items-end gap-2">
      <button
        className="flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white disabled:opacity-50"
        disabled={disabled}
        onClick={onSubmit}
        type="button"
      >
        {editing ? <Save aria-hidden className="h-4 w-4" /> : <Plus aria-hidden className="h-4 w-4" />}
        {editing ? "Save" : "Add"}
      </button>
      {editing ? (
        <IconButton label="Cancel edit" onClick={onCancel}>
          <X aria-hidden className="h-4 w-4" />
        </IconButton>
      ) : null}
    </div>
  );
}

function Chip({ label, onDelete, onEdit }: { label: string; onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-1 rounded-md border-2 border-ink bg-paper p-1">
      <span className="px-2 font-black">{label}</span>
      <IconButton label={`Edit ${label}`} onClick={onEdit} small>
        <Pencil aria-hidden className="h-4 w-4" />
      </IconButton>
      <IconButton danger label={`Delete ${label}`} onClick={onDelete} small>
        <Trash2 aria-hidden className="h-4 w-4" />
      </IconButton>
    </div>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return <th className="p-3 text-sm font-black uppercase">{children}</th>;
}

function IconButton({
  children,
  danger,
  label,
  onClick,
  small
}: {
  children: ReactNode;
  danger?: boolean;
  label: string;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={`grid place-items-center rounded-md ${small ? "h-8 w-8" : "h-10 w-10"} ${danger ? "bg-coral text-white" : "border-2 border-ink bg-white"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-black">
      {label}
      <input
        className="h-11 rounded-md border-2 border-ink px-3 font-bold outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function SelectInput({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-black">
      {label}
      <select
        className="h-11 rounded-md border-2 border-ink bg-white px-3 font-bold outline-none"
        disabled={options.length === 0}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.length === 0 ? <option value="">Add a category first</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberInput({
  label,
  value,
  step = "1",
  onChange
}: {
  label: string;
  value: number;
  step?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-black">
      {label}
      <input
        className="h-11 rounded-md border-2 border-ink px-3 font-bold outline-none"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}
